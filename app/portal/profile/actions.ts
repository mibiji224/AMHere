'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendVerificationEmail } from '@/app/lib/resend';
import crypto from 'crypto';

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// 1. UPDATE PERSONAL DETAILS (with Email Verification)
export async function updateProfile(formData: FormData) {
  const userId = formData.get('userId') as string;
  const newEmail = formData.get('email') as string;
  const contactNumber = formData.get('contactNumber') as string;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return { error: 'User not found' };
  }

  const isEmailChanged = newEmail && newEmail !== user.email;

  if (isEmailChanged) {
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    });

    if (existingUser) {
      return { error: 'This email is already in use by another account.' };
    }

    await prisma.emailVerificationToken.deleteMany({
      where: { userId }
    });

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId,
        newEmail,
        expiresAt
      }
    });

    const result = await sendVerificationEmail({
      to: newEmail,
      token,
      userName: user.firstName
    });

    if (!result.success) {
      return { error: 'Failed to send verification email. Please try again.' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { contactNumber }
    });

    revalidatePath('/portal/profile');
    return { 
      success: true, 
      emailPending: true,
      message: `Verification email sent to ${newEmail}. Please check your inbox.`
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { contactNumber }
  });

  revalidatePath('/portal/profile');
  return { success: true };
}

// 2. REQUEST SCHEDULE CHANGE
export async function requestScheduleChange(formData: FormData) {
  const userId = formData.get('userId') as string;
  const reason = formData.get('reason') as string;
  
  const newStart = formData.get('startTime') as string;
  const newEnd = formData.get('endTime') as string;

  const proposedSchedule: Record<string, string> = {};
  let hasDayChanges = false;
  
  for (let i = 0; i < 7; i++) {
    const dayVal = formData.get(`day-${i}`);
    if (dayVal && typeof dayVal === 'string' && dayVal !== '') {
      proposedSchedule[`day-${i}`] = dayVal;
      hasDayChanges = true;
    }
  }

  await prisma.scheduleChangeRequest.create({
    data: {
      userId,
      reason: reason,
      status: 'PENDING',
      requestedStart: newStart || null,
      requestedEnd: newEnd || null,
      proposedSchedule: hasDayChanges ? proposedSchedule : undefined
    }
  });

  revalidatePath('/portal/profile');
}

// 3. TOGGLE TASK COMPLETION
export async function toggleTask(taskId: string, currentState: boolean) {
  await prisma.task.update({
    where: { id: taskId },
    data: { isCompleted: !currentState }
  });
  revalidatePath('/portal/profile');
}

// 4. CANCEL EMAIL VERIFICATION
export async function cancelEmailVerification(userId: string) {
  await prisma.emailVerificationToken.deleteMany({
    where: { userId }
  });
  revalidatePath('/portal/profile');
  return { success: true };
}

// 5. RESEND VERIFICATION EMAIL
export async function resendVerificationEmail(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: 'User not found' };

  const pendingToken = await prisma.emailVerificationToken.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  if (!pendingToken) {
    return { error: 'No pending email verification found' };
  }

  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const newToken = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: {
      token: newToken,
      userId,
      newEmail: pendingToken.newEmail,
      expiresAt
    }
  });

  const result = await sendVerificationEmail({
    to: pendingToken.newEmail,
    token: newToken,
    userName: user.firstName
  });

  if (!result.success) {
    return { error: 'Failed to send verification email' };
  }

  return { success: true, message: 'Verification email resent!' };
}
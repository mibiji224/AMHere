'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. UPDATE PERSONAL DETAILS (Direct Update)
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

  // Check if email is changing and if it is taken
  if (newEmail && newEmail !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    });

    if (existingUser) {
      return { error: 'This email is already in use by another account.' };
    }
  }

  // Update directly
  await prisma.user.update({
    where: { id: userId },
    data: { 
      email: newEmail,
      contactNumber 
    }
  });

  revalidatePath('/portal/profile');
  return { success: true, message: 'Profile updated successfully' };
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
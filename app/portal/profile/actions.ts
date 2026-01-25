'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. UPDATE PERSONAL DETAILS (contact number only now)
export async function updateProfile(formData: FormData) {
  const userId = formData.get('userId') as string;
  const contactNumber = formData.get('contactNumber') as string;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return { error: 'User not found' };
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

// 4. UNLINK GOOGLE ACCOUNT
export async function unlinkGoogleAccount(userId: string) {
  try {
    await prisma.linkedGoogleAccount.delete({
      where: { userId }
    });
    revalidatePath('/portal/profile');
    return { success: true };
  } catch (error) {
    console.error('Unlink error:', error);
    return { error: 'Failed to unlink Google account' };
  }
}

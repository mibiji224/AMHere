'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. UPDATE PERSONAL DETAILS (Unchanged)
export async function updateProfile(formData: FormData) {
  const userId = formData.get('userId') as string;
  const email = formData.get('email') as string;
  const contactNumber = formData.get('contactNumber') as string;

  await prisma.user.update({
    where: { id: userId },
    data: { email, contactNumber }
  });
  revalidatePath('/portal/profile');
}

// 2. REQUEST SCHEDULE CHANGE (Updated to handle Days AND Time)
export async function requestScheduleChange(formData: FormData) {
  const userId = formData.get('userId') as string;
  const reason = formData.get('reason') as string;
  
  // Check for Time Change inputs
  const newStart = formData.get('startTime') as string;
  const newEnd = formData.get('endTime') as string;

  // Check for Day Change inputs
  const proposedSchedule: Record<string, string> = {};
  let hasDayChanges = false;
  
  for (let i = 0; i < 7; i++) {
    const dayVal = formData.get(`day-${i}`);
    if (dayVal && typeof dayVal === 'string' && dayVal !== '') {
      proposedSchedule[`day-${i}`] = dayVal;
      hasDayChanges = true;
    }
  }

  // Create the Request
  await prisma.scheduleChangeRequest.create({
    data: {
      userId,
      reason: reason,
      status: 'PENDING',
      // If time inputs exist, save them
      requestedStart: newStart || null,
      requestedEnd: newEnd || null,
      // If day inputs exist, save the JSON
      proposedSchedule: hasDayChanges ? proposedSchedule : undefined
    }
  });

  revalidatePath('/portal/profile');
}

// 3. TOGGLE TASK COMPLETION (Unchanged)
export async function toggleTask(taskId: string, currentState: boolean) {
  await prisma.task.update({
    where: { id: taskId },
    data: { isCompleted: !currentState }
  });
  revalidatePath('/portal/profile');
}
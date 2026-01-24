'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function approveScheduleChange(formData: FormData) {
  const requestId = formData.get('requestId') as string;

  const request = await prisma.scheduleChangeRequest.findUnique({
    where: { id: requestId }
  });

  if (!request) return;

  // 1. IF IT IS A TIME CHANGE
  if (request.requestedStart && request.requestedEnd) {
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        shiftStart: request.requestedStart,
        shiftEnd: request.requestedEnd
      }
    });
  } 
  // 2. IF IT IS A DAY SCHEDULE CHANGE
  else if (request.proposedSchedule) {
    // Delete old schedule
    await prisma.schedule.deleteMany({ where: { userId: request.userId } });

    // Create new entries
    const newSchedules = [];
    const scheduleObj = request.proposedSchedule as Record<string, string>;

    for (let i = 0; i < 7; i++) {
      const type = scheduleObj[`day-${i}`];
      if (type && type !== 'OFF' && type !== '') {
        newSchedules.push({
          dayOfWeek: i,
          workType: type as 'ONSITE' | 'REMOTE',
          userId: request.userId
        });
      }
    }

    if (newSchedules.length > 0) {
      await prisma.schedule.createMany({ data: newSchedules });
    }
  }

  // 3. Mark Request as Approved
  await prisma.scheduleChangeRequest.update({
    where: { id: requestId },
    data: { status: 'APPROVED' }
  });

  revalidatePath('/admin/schedules');
}

export async function rejectScheduleChange(formData: FormData) {
  const requestId = formData.get('requestId') as string;
  
  await prisma.scheduleChangeRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' }
  });

  revalidatePath('/admin/schedules');
}
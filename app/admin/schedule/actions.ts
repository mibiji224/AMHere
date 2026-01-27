'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function saveAllSchedules(formData: FormData) {
  const entries = Array.from(formData.entries());

  // Group by userId
  const schedulesByUser: Record<string, { dayOfWeek: number; workType: string }[]> = {};

  for (const [key, value] of entries) {
    if (key.includes(':::')) {
      const [userId, dayIndex] = key.split(':::');
      const workType = value as string;

      if (!schedulesByUser[userId]) {
        schedulesByUser[userId] = [];
      }

      if (workType !== 'REST') {
        schedulesByUser[userId].push({
          dayOfWeek: parseInt(dayIndex),
          workType: workType
        });
      }
    }
  }

  // Update schedules for each user
  for (const [userId, schedules] of Object.entries(schedulesByUser)) {
    // Delete existing schedules
    await prisma.schedule.deleteMany({ where: { userId } });

    // Create new schedules
    if (schedules.length > 0) {
      await prisma.schedule.createMany({
        data: schedules.map(s => ({
          userId,
          dayOfWeek: s.dayOfWeek,
          workType: s.workType as 'ONSITE' | 'REMOTE'
        }))
      });
    }
  }

  revalidatePath('/admin/schedule');
}

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
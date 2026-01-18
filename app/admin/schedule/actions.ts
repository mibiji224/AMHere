'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------
// 1. BULK SAVE ACTION (Weekly Schedule)
// ---------------------------------------------------------
export async function saveAllSchedules(formData: FormData) {
  const updates: Record<string, { dayOfWeek: number; workType: 'ONSITE' | 'REMOTE' }[]> = {};

  for (const [key, value] of formData.entries()) {
    if (key.includes(':::')) {
      const [userId, dayIndex] = key.split(':::');
      const type = value.toString();

      if (!updates[userId]) {
        updates[userId] = [];
      }

      if (type === 'ONSITE' || type === 'REMOTE') {
        updates[userId].push({
          dayOfWeek: parseInt(dayIndex),
          workType: type as 'ONSITE' | 'REMOTE'
        });
      }
    }
  }

  const userIds = Object.keys(updates);
  
  await Promise.all(
    userIds.map(async (userId) => {
      await prisma.schedule.deleteMany({ where: { userId } });
      
      const newSchedules = updates[userId].map(s => ({
        userId,
        dayOfWeek: s.dayOfWeek,
        workType: s.workType
      }));

      if (newSchedules.length > 0) {
        await prisma.schedule.createMany({ data: newSchedules });
      }
    })
  );

  revalidatePath('/admin/schedule');
}

// ---------------------------------------------------------
// 2. SCHEDULE CHANGE REQUESTS
// ---------------------------------------------------------
export async function approveRequest(requestId: string) {
  const request = await prisma.scheduleChangeRequest.findUnique({ 
    where: { id: requestId } 
  });
  
  if (!request) return;

  if (request.proposedSchedule && Array.isArray(request.proposedSchedule)) {
    const newScheduleData = request.proposedSchedule as any[];

    await prisma.schedule.deleteMany({ where: { userId: request.userId } });
    
    if (newScheduleData.length > 0) {
       await prisma.schedule.createMany({ 
         data: newScheduleData.map((s: any) => ({
           userId: request.userId,
           dayOfWeek: s.dayOfWeek,
           workType: s.workType
         })) 
       });
    }
  }

  await prisma.scheduleChangeRequest.update({
    where: { id: requestId },
    data: { status: 'APPROVED' }
  });

  revalidatePath('/admin/schedule'); 
  revalidatePath('/portal');
}

export async function rejectRequest(requestId: string) {
  await prisma.scheduleChangeRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' }
  });
  revalidatePath('/admin/schedule');
}

// ---------------------------------------------------------
// 3. LEAVE REQUESTS (New Logic)
// ---------------------------------------------------------
export async function approveLeaveRequest(requestId: string) {
  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: { user: true }
  });

  if (!request) return;

  // Logic: If Paid Leave, Deduct 1 Credit
  if (request.type === 'PAID') {
    if (request.user.leaveCredits > 0) {
      await prisma.user.update({
        where: { id: request.userId },
        data: { leaveCredits: { decrement: 1 } }
      });
    }
    // Note: If 0 credits, we currently still approve but don't deduct negative.
    // You can add an 'else' here to throw an error if strict enforcement is needed.
  }

  await prisma.leaveRequest.update({
    where: { id: requestId },
    data: { status: 'APPROVED' }
  });

  revalidatePath('/admin/schedule');
}

export async function rejectLeaveRequest(requestId: string) {
  await prisma.leaveRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' }
  });
  revalidatePath('/admin/schedule');
}
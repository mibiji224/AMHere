'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------
// 1. BULK SAVE ACTION (For the Editor Grid)
// ---------------------------------------------------------
export async function saveAllSchedules(formData: FormData) {
  const updates: Record<string, { dayOfWeek: number; workType: 'ONSITE' | 'REMOTE' }[]> = {};

  // Parse Form Data
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

  // Perform Batch Updates
  const userIds = Object.keys(updates);
  
  await Promise.all(
    userIds.map(async (userId) => {
      // A. Clear old schedule
      await prisma.schedule.deleteMany({ where: { userId } });
      
      // B. Insert new schedule (if any)
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
// 2. REQUEST APPROVAL ACTIONS (The Fix)
// ---------------------------------------------------------
export async function approveRequest(requestId: string) {
  // 1. Fetch the Request
  const request = await prisma.scheduleChangeRequest.findUnique({ 
    where: { id: requestId } 
  });
  
  if (!request) return;

  // 2. Check if there is a proposed schedule attached
  if (request.proposedSchedule && Array.isArray(request.proposedSchedule)) {
    
    const newScheduleData = request.proposedSchedule as any[];

    // A. Delete the Employee's OLD Schedule
    await prisma.schedule.deleteMany({ 
      where: { userId: request.userId } 
    });
    
    // B. Insert the NEW Schedule
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

  // 3. Mark as Approved
  await prisma.scheduleChangeRequest.update({
    where: { id: requestId },
    data: { status: 'APPROVED' }
  });

  // 4. Force Update UI
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
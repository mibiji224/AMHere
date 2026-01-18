'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------
// 1. SUBMIT SCHEDULE CHANGE (Dynamic Fix)
// ---------------------------------------------------------
export async function submitScheduleChange(formData: FormData) {
  // 👇 FIX: Get the email dynamically from the form (Hidden Input)
  const userEmail = formData.get('userEmail') as string;

  if (!userEmail) {
    console.error("No user email provided in form");
    return;
  }

  // Find the user who is actually logged in
  const user = await prisma.user.findUnique({
    where: { email: userEmail } 
  });

  if (!user) return;

  const reason = formData.get('reason') as string;

  // Extract Schedule
  const proposedSchedule = [];
  for (let i = 0; i < 7; i++) {
    const type = formData.get(`day-${i}`);
    if (type === 'ONSITE' || type === 'REMOTE') {
      proposedSchedule.push({
        dayOfWeek: i,
        workType: type
      });
    }
  }

  // Create Request
  await prisma.scheduleChangeRequest.create({
    data: {
      userId: user.id,
      reason,
      status: 'PENDING',
      proposedSchedule: proposedSchedule
    }
  });

  revalidatePath('/portal');
}

// ---------------------------------------------------------
// 2. LEAVE REQUEST (Also needs the fix!)
// ---------------------------------------------------------
export async function submitLeaveRequest(formData: FormData) {
  // 👇 FIX: Get email dynamically
  const userEmail = formData.get('userEmail') as string;

  const user = await prisma.user.findUnique({
    where: { email: userEmail } 
  });

  if (!user) return;

  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  const reason = formData.get('reason') as string;

  await prisma.leaveRequest.create({
    data: {
      userId: user.id,
      startDate,
      endDate,
      reason,
      status: 'PENDING'
    }
  });

  revalidatePath('/portal');
}
'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------
// 1. SUBMIT SCHEDULE CHANGE
// ---------------------------------------------------------
export async function submitScheduleChange(formData: FormData) {
  const userEmail = formData.get('userEmail') as string;

  if (!userEmail) return;

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
// 2. SUBMIT LEAVE REQUEST (Updated with Leave Type)
// ---------------------------------------------------------
export async function submitLeaveRequest(formData: FormData) {
  const userEmail = formData.get('userEmail') as string;

  const user = await prisma.user.findUnique({
    where: { email: userEmail } 
  });

  if (!user) return;

  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  const reason = formData.get('reason') as string;
  
  // 👇 NEW: Capture the Leave Type
  const type = formData.get('type') as 'PAID' | 'UNPAID';

  // Basic Validation
  if (startDate > endDate) return;

  await prisma.leaveRequest.create({
    data: {
      userId: user.id,
      startDate,
      endDate,
      reason,
      type: type || 'UNPAID', // Default to UNPAID if missing
      status: 'PENDING'
    }
  });

  revalidatePath('/portal');
}
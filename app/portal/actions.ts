'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------
// 1. CLOCK IN ACTION
// ---------------------------------------------------------
export async function ClockInButton(formData: FormData) {
  const userId = formData.get('userId') as string;
  if (!userId) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findFirst({
    where: {
      userId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  if (!existing) {
    await prisma.attendance.create({
      data: {
        userId,
        timeIn: new Date(),
        status: 'PRESENT'
      }
    });
  }
  revalidatePath('/portal');
}

// ---------------------------------------------------------
// 2. CLOCK OUT ACTION
// ---------------------------------------------------------
export async function ClockOutButton(formData: FormData) {
  const userId = formData.get('userId') as string;
  if (!userId) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeSession = await prisma.attendance.findFirst({
    where: {
      userId,
      timeOut: null,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  if (activeSession) {
    await prisma.attendance.update({
      where: { id: activeSession.id },
      data: { timeOut: new Date() }
    });
  }
  revalidatePath('/portal');
}

// ---------------------------------------------------------
// 3. TOGGLE BREAK (Start/End)
// ---------------------------------------------------------
export async function toggleBreak(formData: FormData) {
  const userId = formData.get('userId') as string;
  if (!userId) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId,
      date: { gte: today },
      timeOut: null
    }
  });

  if (!attendance) return;

  if (attendance.breakStart && !attendance.breakEnd) {
    // End Break
    await prisma.attendance.update({
      where: { id: attendance.id },
      data: { breakEnd: new Date() }
    });
  } else if (!attendance.breakStart) {
    // Start Break
    await prisma.attendance.update({
      where: { id: attendance.id },
      data: { breakStart: new Date() }
    });
  }
  revalidatePath('/portal');
}

// ---------------------------------------------------------
// 4. SUBMIT SCHEDULE CHANGE
// ---------------------------------------------------------
export async function submitScheduleChange(formData: FormData) {
  const userEmail = formData.get('userEmail') as string;
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return;

  const reason = formData.get('reason') as string;
  const proposedSchedule = [];
  for (let i = 0; i < 7; i++) {
    const type = formData.get(`day-${i}`);
    if (type === 'ONSITE' || type === 'REMOTE') {
      proposedSchedule.push({ dayOfWeek: i, workType: type });
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
  revalidatePath('/portal/requests');
}

// ---------------------------------------------------------
// 5. SUBMIT LEAVE REQUEST
// ---------------------------------------------------------
export async function submitLeaveRequest(formData: FormData) {
  const userEmail = formData.get('userEmail') as string;
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return;

  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  const reason = formData.get('reason') as string;
  const type = formData.get('type') as 'PAID' | 'UNPAID';

  if (startDate > endDate) return;

  await prisma.leaveRequest.create({
    data: {
      userId: user.id,
      startDate,
      endDate,
      reason,
      type: type || 'UNPAID',
      status: 'PENDING'
    }
  });
  revalidatePath('/portal/requests');
}
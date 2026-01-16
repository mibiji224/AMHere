'use server'

// ✅ IMPORTS ARE AT THE TOP (This fixes your error)
import { prisma } from './lib/prisma';
import { revalidatePath } from 'next/cache';
import { Role, AttendanceStatus } from '@prisma/client';

// ---------------------------------------------------------
// 1. Function to Add a New Employee
// ---------------------------------------------------------
export async function createEmployee(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const position = formData.get('position') as string;
  const hourlyRate = parseFloat(formData.get('hourlyRate') as string);

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      position,
      hourlyRate,
      role: Role.EMPLOYEE,
    },
  });

  revalidatePath('/');
}

// ---------------------------------------------------------
// 2. Function to Clock In / Clock Out
// ---------------------------------------------------------
export async function toggleAttendance(userId: string) {
  // Check if the user has an open session (Clocked In but not Out)
  const activeLog = await prisma.attendance.findFirst({
    where: {
      userId: userId,
      timeOut: null, // Still open
    },
  });

  if (activeLog) {
    // 🛑 CLOCK OUT
    await prisma.attendance.update({
      where: { id: activeLog.id },
      data: {
        timeOut: new Date(),
        status: AttendanceStatus.PRESENT, // Mark as done
      },
    });
  } else {
    // 🟢 CLOCK IN
    await prisma.attendance.create({
      data: {
        userId: userId,
        date: new Date(), // Today's date
        timeIn: new Date(), // Right now
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  // Refresh both the dashboard and the attendance page
  revalidatePath('/');
  revalidatePath('/attendance');
}
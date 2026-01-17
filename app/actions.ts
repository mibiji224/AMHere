'use server'

import { prisma } from './lib/prisma';
import { revalidatePath } from 'next/cache';
import { Role, AttendanceStatus } from '@prisma/client';

// ---------------------------------------------------------
// 1. Function to Add a New Employee
// ---------------------------------------------------------
// 1. Function to Add a New Employee (With Random ID)
export async function createEmployee(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const position = formData.get('position') as string;
  const hourlyRate = parseFloat(formData.get('hourlyRate') as string);

  // 🎲 Generate a random 6-digit code
  const randomId = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      position,
      hourlyRate,
      employeeId: randomId, // 👈 Saving the generated code
      role: Role.EMPLOYEE,
    },
  });

  revalidatePath('/');
}

// ---------------------------------------------------------
// 2. Function to Clock In / Clock Out
// ---------------------------------------------------------
export async function toggleAttendance(userId: string) {
  const activeLog = await prisma.attendance.findFirst({
    where: {
      userId: userId,
      timeOut: null,
    },
  });

  if (activeLog) {
    // 🛑 CLOCK OUT
    await prisma.attendance.update({
      where: { id: activeLog.id },
      data: {
        timeOut: new Date(),
        status: AttendanceStatus.PRESENT,
      },
    });
  } else {
    // 🟢 CLOCK IN
    await prisma.attendance.create({
      data: {
        userId: userId,
        date: new Date(),
        timeIn: new Date(),
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  revalidatePath('/');
  revalidatePath('/attendance');
}

// 3. Function to Delete an Employee (Bulletproof Version)
export async function deleteEmployee(userId: string) {

  // A. Find all attendance records for this user first
  const userAttendance = await prisma.attendance.findMany({
    where: { userId: userId },
    select: { id: true } // We only need the IDs
  });

  // Extract the list of IDs (e.g. ['id1', 'id2'])
  const attendanceIds = userAttendance.map(record => record.id);

  // B. Delete all DailyLogs connected to those attendance records
  if (attendanceIds.length > 0) {
    await prisma.dailyLog.deleteMany({
      where: {
        attendanceId: { in: attendanceIds }
      }
    });

    // C. Now that Logs are gone, delete the Attendance records
    await prisma.attendance.deleteMany({
      where: { userId: userId }
    });
  }

  // D. Finally, delete the User (now safe!)
  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath('/');
}

// ... existing imports ...

// 4. Function to Toggle Break
export async function toggleBreak(attendanceId: string) {
  const log = await prisma.attendance.findUnique({
    where: { id: attendanceId }
  });

  if (!log) return;

  if (log.breakStart && !log.breakEnd) {
    // END BREAK
    await prisma.attendance.update({
      where: { id: attendanceId },
      data: { breakEnd: new Date() }
    });
  } else {
    // START BREAK (Only if they haven't taken one yet, or allow multiples?)
    // For now, let's assume one break per shift as per your "1 hour limit" rule.
    await prisma.attendance.update({
      where: { id: attendanceId },
      data: { breakStart: new Date() }
    });
  }

  revalidatePath('/portal');
}
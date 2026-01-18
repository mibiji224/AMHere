'use server'

import { prisma } from './lib/prisma';
import { revalidatePath } from 'next/cache';
import { Role, AttendanceStatus } from '@prisma/client';

// ---------------------------------------------------------
// 1. REGISTER EMPLOYEE (Updated with Bio-Data & Schedule)
// ---------------------------------------------------------
export async function registerEmployee(formData: FormData) {
  // Extract Standard Fields
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const employeeId = formData.get('employeeId') as string;
  const position = formData.get('position') as string;
  
  // Extract Numbers & Dates
  const hourlyRateRaw = formData.get('hourlyRate') as string;
  const hourlyRate = parseFloat(hourlyRateRaw || '0');
  
  const birthdayRaw = formData.get('birthday') as string;
  const birthday = birthdayRaw ? new Date(birthdayRaw) : null;

  // A. Create the User in Database
  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      employeeId, // Uses the ID typed in the form
      position,
      hourlyRate,
      birthday,
      password: '123456', // Default password
      role: Role.EMPLOYEE,
    }
  });

  // B. Extract & Create Schedule
  // We loop through day-0 (Sun) to day-6 (Sat)
  const scheduleData = [];
  for (let i = 0; i < 7; i++) {
    const type = formData.get(`day-${i}`); // value is 'ONSITE', 'REMOTE', or 'REST'
    
    if (type && type !== 'REST') {
      scheduleData.push({
        userId: newUser.id,
        dayOfWeek: i,
        workType: type as 'ONSITE' | 'REMOTE'
      });
    }
  }

  // Bulk Insert Schedule
  if (scheduleData.length > 0) {
    await prisma.schedule.createMany({
      data: scheduleData
    });
  }

  // C. Refresh Admin List
  revalidatePath('/');
}

// ---------------------------------------------------------
// 2. TOGGLE ATTENDANCE (Clock In / Clock Out)
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

  revalidatePath('/portal');
  revalidatePath('/admin/employees');
}

// ---------------------------------------------------------
// 3. TOGGLE BREAK (Start / End)
// ---------------------------------------------------------
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
    // START BREAK
    // (Only if they haven't taken one yet)
    if (!log.breakStart) {
      await prisma.attendance.update({
        where: { id: attendanceId },
        data: { breakStart: new Date() }
      });
    }
  }

  revalidatePath('/portal');
}

// ---------------------------------------------------------
// 4. DELETE EMPLOYEE (Bulletproof Version)
// ---------------------------------------------------------
export async function deleteEmployee(userId: string) {

  // A. Find all attendance records for this user first
  const userAttendance = await prisma.attendance.findMany({
    where: { userId: userId },
    select: { id: true } 
  });

  const attendanceIds = userAttendance.map(record => record.id);

  // B. Delete all DailyLogs connected to those attendance records
  if (attendanceIds.length > 0) {
    await prisma.dailyLog.deleteMany({
      where: {
        attendanceId: { in: attendanceIds }
      }
    });

    // C. Now delete the Attendance records
    await prisma.attendance.deleteMany({
      where: { userId: userId }
    });
  }

  // D. Delete Schedule records (New Requirement)
  await prisma.schedule.deleteMany({
    where: { userId: userId }
  });

  // E. Finally, delete the User
  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath('/admin/employees');
}
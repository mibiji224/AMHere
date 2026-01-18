'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function submitLeaveRequest(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;

  if (!userId) redirect('/login');

  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  const reason = formData.get('reason') as string;

  await prisma.leaveRequest.create({
    data: {
      userId,
      startDate,
      endDate,
      reason,
      status: 'PENDING'
    }
  });

  revalidatePath('/portal');
}

export async function submitScheduleChange(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;

  if (!userId) redirect('/login');

  const reason = formData.get('reason') as string;

  await prisma.scheduleChangeRequest.create({
    data: {
      userId,
      reason,
      status: 'PENDING'
    }
  });

  revalidatePath('/portal');
}
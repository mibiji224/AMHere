'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function saveSchedule(userId: string, formData: FormData) {
  const updates = [];

  // Loop through days 0 (Sunday) to 6 (Saturday)
  for (let i = 0; i < 7; i++) {
    const type = formData.get(`day-${i}`); // e.g., "ONSITE", "REMOTE", or null
    
    if (type && type !== 'REST') {
      updates.push({
        userId,
        dayOfWeek: i,
        workType: type as 'ONSITE' | 'REMOTE'
      });
    }
  }

  // Transaction: Delete old schedule -> Add new one
  await prisma.$transaction([
    prisma.schedule.deleteMany({ where: { userId } }),
    prisma.schedule.createMany({ data: updates })
  ]);

  revalidatePath('/admin/schedule');
}
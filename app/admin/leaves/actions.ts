'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function approveLeave(requestId: string) {
  await prisma.leaveRequest.update({
    where: { id: requestId },
    data: { status: 'APPROVED' }
  });
  revalidatePath('/admin/leaves');
}

export async function rejectLeave(requestId: string) {
  await prisma.leaveRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' }
  });
  revalidatePath('/admin/leaves');
}

// 👇 Utility for testing: Create a dummy request so you can see something on the screen
export async function createTestRequest(userId: string) {
    // Find the user first to make sure they exist
    const user = await prisma.user.findUnique({ where: { id: userId }});
    if(!user) return;

    await prisma.leaveRequest.create({
        data: {
            userId: userId,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
            reason: "Not feeling well (Test Request)",
            status: "PENDING"
        }
    });
    revalidatePath('/admin/leaves');
}
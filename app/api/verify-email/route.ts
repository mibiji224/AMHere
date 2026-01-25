import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/portal/profile?error=invalid_token', request.url));
  }

  try {
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/portal/profile?error=invalid_token', request.url));
    }

    if (verificationToken.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id }
      });
      return NextResponse.redirect(new URL('/portal/profile?error=token_expired', request.url));
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: verificationToken.newEmail }
    });

    if (existingUser && existingUser.id !== verificationToken.userId) {
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id }
      });
      return NextResponse.redirect(new URL('/portal/profile?error=email_taken', request.url));
    }

    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { email: verificationToken.newEmail }
    });

    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id }
    });

    return NextResponse.redirect(new URL('/portal/profile?success=email_verified', request.url));

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/portal/profile?error=verification_failed', request.url));
  }
}
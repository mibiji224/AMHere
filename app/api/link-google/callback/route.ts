import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { OAuth2Client } from 'google-auth-library';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state'); // userId
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    console.log('Google auth error:', error);
    return NextResponse.redirect(new URL('/portal/profile?error=google_auth_cancelled', request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/portal/profile?error=invalid_callback', request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const client = new OAuth2Client(clientId, clientSecret, `${baseUrl}/api/link-google/callback`);

  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.redirect(new URL('/portal/profile?error=invalid_token', request.url));
    }

    const googleId = payload.sub;
    const googleEmail = payload.email!;
    const googleName = payload.name || null;
    const googlePicture = payload.picture || null;

    // Check if this Google account is already linked to another user
    const existingLink = await prisma.linkedGoogleAccount.findUnique({
      where: { googleId },
    });

    if (existingLink && existingLink.userId !== state) {
      return NextResponse.redirect(
        new URL('/portal/profile?error=google_already_linked', request.url)
      );
    }

    // Check if user already has a linked Google account
    const userExistingLink = await prisma.linkedGoogleAccount.findUnique({
      where: { userId: state },
    });

    if (userExistingLink) {
      // Update existing link
      await prisma.linkedGoogleAccount.update({
        where: { userId: state },
        data: {
          googleId,
          email: googleEmail,
          name: googleName,
          picture: googlePicture,
          linkedAt: new Date(),
        },
      });
    } else {
      // Create new link
      await prisma.linkedGoogleAccount.create({
        data: {
          googleId,
          email: googleEmail,
          name: googleName,
          picture: googlePicture,
          userId: state,
        },
      });
    }

    return NextResponse.redirect(new URL('/portal/profile?success=google_linked', request.url));

  } catch (error) {
    console.error('Google link error:', error);
    return NextResponse.redirect(new URL('/portal/profile?error=link_failed', request.url));
  }
}

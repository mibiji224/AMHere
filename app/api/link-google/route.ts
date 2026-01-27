import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

// GET: Redirect to Google OAuth
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.redirect(new URL('/portal/profile?error=missing_user', request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!clientId || !clientSecret || clientId === 'your_google_client_id_here') {
    console.error('Google OAuth credentials not configured');
    return NextResponse.redirect(new URL('/portal/profile?error=oauth_not_configured', request.url));
  }

  const client = new OAuth2Client(clientId, clientSecret, `${baseUrl}/api/link-google/callback`);

  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    state: userId,
    prompt: 'select_account',
  });

  return NextResponse.redirect(authUrl);
}

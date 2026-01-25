import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;

  // Check if API key exists
  if (!apiKey) {
    return NextResponse.json({
      error: 'RESEND_API_KEY is not set',
      hint: 'Make sure .env file has RESEND_API_KEY and restart the dev server'
    }, { status: 500 });
  }

  // Check API key format
  if (!apiKey.startsWith('re_')) {
    return NextResponse.json({
      error: 'Invalid API key format',
      hint: 'Resend API keys should start with "re_"'
    }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    // Try to send a test email to the Resend test address
    const { data, error } = await resend.emails.send({
      from: 'AMHere <onboarding@resend.dev>',
      to: ['delivered@resend.dev'], // Resend's test email that always succeeds
      subject: 'Test Email from AMHere',
      html: '<p>This is a test email to verify Resend is working.</p>',
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        errorDetails: error,
        hint: 'Check if your API key is valid at resend.com/api-keys'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Resend is configured correctly!',
      emailId: data?.id
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      hint: 'Check terminal for more details'
    }, { status: 500 });
  }
}

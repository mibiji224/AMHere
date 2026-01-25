import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.warn('WARNING: RESEND_API_KEY is not set in environment variables');
}

const resend = new Resend(apiKey);

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SendVerificationEmailParams {
  to: string;
  token: string;
  userName: string;
}

export async function sendVerificationEmail({ to, token, userName }: SendVerificationEmailParams) {
  const verificationLink = `${BASE_URL}/api/verify-email?token=${token}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'AMHere <onboarding@resend.dev>', // Use your verified domain in production
      to: [to],
      subject: 'Verify Your New Email Address - AMHere',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">AMHere</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Employee Portal</p>
              </div>
              
              <div style="padding: 32px;">
                <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 20px;">Verify Your Email</h2>
                
                <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px 0;">
                  Hi <strong>${userName}</strong>,
                </p>
                
                <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px 0;">
                  You requested to change your email address. Click the button below to verify this new email address:
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${verificationLink}" 
                     style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    Verify Email Address
                  </a>
                </div>
                
                <p style="color: #71717a; font-size: 13px; line-height: 1.6; margin: 0 0 16px 0;">
                  Or copy and paste this link into your browser:
                </p>
                
                <div style="background: #f4f4f5; padding: 12px; border-radius: 6px; word-break: break-all;">
                  <code style="color: #3b82f6; font-size: 12px;">${verificationLink}</code>
                </div>
                
                <div style="border-top: 1px solid #e4e4e7; margin-top: 32px; padding-top: 24px;">
                  <p style="color: #a1a1aa; font-size: 12px; margin: 0; line-height: 1.5;">
                    ⏰ This link expires in <strong>1 hour</strong>.<br>
                    🔒 If you didn't request this change, please ignore this email.
                  </p>
                </div>
              </div>
              
              <div style="background: #fafafa; padding: 20px 32px; text-align: center; border-top: 1px solid #e4e4e7;">
                <p style="color: #a1a1aa; font-size: 11px; margin: 0;">
                  © ${new Date().getFullYear()} AMHere. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
    return { success: false, error: errorMessage };
  }
}   
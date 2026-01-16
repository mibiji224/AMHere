'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const password = formData.get('password') as string;

  // Check if password matches the one in .env
  if (password === process.env.ADMIN_PASSWORD) {
    // ✅ Success! Give the user a cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    
    redirect('/'); // Send them to the dashboard
  } else {
    // ❌ Wrong password
    redirect('/login?error=Invalid Password');
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/login');
}
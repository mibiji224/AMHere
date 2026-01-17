'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '../lib/prisma';

export async function login(formData: FormData) {
  const loginType = formData.get('loginType') as string;
  const cookieStore = await cookies();

  // 🔴 CASE 1: ADMIN LOGIN (Email + Password)
  if (loginType === 'ADMIN') {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (email === 'admin@company.com' && password === process.env.ADMIN_PASSWORD) {
      cookieStore.set('session_role', 'ADMIN', { path: '/' });
      redirect('/'); 
    }
  }

  // 🟢 CASE 2: EMPLOYEE LOGIN (LastName + ID Code)
  if (loginType === 'EMPLOYEE') {
    const lastName = formData.get('lastName') as string;
    const employeeId = formData.get('employeeId') as string;

    // Find user matching BOTH name and code
    const user = await prisma.user.findFirst({
      where: { 
        lastName: { equals: lastName, mode: 'insensitive' }, // Case insensitive (soronio = Soronio)
        employeeId: employeeId,
        role: 'EMPLOYEE'
      }
    });

    if (user) {
      cookieStore.set('session_role', 'EMPLOYEE', { path: '/' });
      cookieStore.set('session_userid', user.id, { path: '/' });
      redirect('/portal');
    }
  }

  // ❌ FAILED
  redirect('/login?error=Invalid Credentials');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session_role');
  cookieStore.delete('session_userid');
  redirect('/login');
}
'use server'

import { prisma } from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ----------------------------------------------------------------------
// 1. EMPLOYEE LOGIN -> Redirects to /portal
// ----------------------------------------------------------------------
export async function loginEmployee(formData: FormData) {
  const lastName = formData.get('lastName') as string;
  const employeeId = formData.get('employeeId') as string;

  if (!lastName || !employeeId) return;

  const user = await prisma.user.findFirst({
    where: {
      lastName: { equals: lastName, mode: 'insensitive' },
      employeeId: employeeId,
      role: 'EMPLOYEE'
    }
  });

  if (!user) return; 

  const cookieStore = await cookies();
  cookieStore.set('session_userid', user.id, { httpOnly: true, secure: true });
  cookieStore.set('session_role', user.role, { httpOnly: true, secure: true });

  redirect('/portal');
}

// ----------------------------------------------------------------------
// 2. ADMIN LOGIN -> Redirects to /admin/employees
// ----------------------------------------------------------------------
export async function loginAdmin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  let user = await prisma.user.findUnique({
    where: { email }
  });

  // Auto-Create Admin if missing (for testing)
  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          email,
          password, 
          role: 'ADMIN',
          firstName: 'System',
          lastName: 'Admin',
          employeeId: '999999'
        }
      });
    } catch (error) {
      return;
    }
  }

  if (user.password !== password || user.role !== 'ADMIN') return;

  const cookieStore = await cookies();
  cookieStore.set('session_userid', user.id, { httpOnly: true, secure: true });
  cookieStore.set('session_role', user.role, { httpOnly: true, secure: true });

  redirect('/admin/employees'); // This is your "Management System" main page
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session_userid');
  cookieStore.delete('session_role');
  redirect('/login');
}
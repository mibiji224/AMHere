'use server'

import { prisma } from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

// Define response type for server actions
export type LoginResponse = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
};

// ----------------------------------------------------------------------
// 1. EMPLOYEE LOGIN -> Returns success with redirect path
// ----------------------------------------------------------------------
export async function loginEmployee(formData: FormData): Promise<LoginResponse> {
  try {
    const lastName = formData.get('lastName') as string;
    const employeeId = formData.get('employeeId') as string;

    if (!lastName || !employeeId) {
      return { error: 'Please enter both surname and ID code.' };
    }

    const user = await prisma.user.findFirst({
      where: {
        lastName: { equals: lastName, mode: 'insensitive' },
        employeeId: employeeId,
        role: 'EMPLOYEE'
      }
    });

    if (!user) {
      return { error: 'Invalid surname or ID code. Please check and try again.' };
    }

    const cookieStore = await cookies();

    cookieStore.set('session_userid', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    cookieStore.set('session_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return { success: true, redirectTo: '/portal' };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An error occurred during login. Please try again.' };
  }
}

// ----------------------------------------------------------------------
// 2. ADMIN LOGIN -> Returns success with redirect path
// ----------------------------------------------------------------------
export async function loginAdmin(formData: FormData): Promise<LoginResponse> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { error: 'Please enter both email and password.' };
    }

    let user = await prisma.user.findUnique({
      where: { email }
    });

    // AUTO-CREATE ADMIN (Only for initial setup/testing)
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'ADMIN',
          firstName: 'System',
          lastName: 'Admin',
          employeeId: '999999'
        }
      });
    }

    // Check if the user is an admin
    if (user.role !== 'ADMIN') {
      return { error: 'This account does not have admin access.' };
    }

    // Verify the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: 'Invalid email or password. Please try again.' };
    }

    const cookieStore = await cookies();

    cookieStore.set('session_userid', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    cookieStore.set('session_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return { success: true, redirectTo: '/admin/employees' };
  } catch (error) {
    console.error('Admin login error:', error);
    return { error: 'An error occurred during login. Please try again.' };
  }
}

// ----------------------------------------------------------------------
// 3. LOGOUT
// ----------------------------------------------------------------------
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session_userid');
  cookieStore.delete('session_role');
  redirect('/login');
}
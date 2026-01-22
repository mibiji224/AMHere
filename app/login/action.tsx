'use server'

import { prisma } from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcrypt'; // Ensure you ran: npm install bcrypt

// Define error type for server actions
export type LoginError = {
  error: string;
};

// ----------------------------------------------------------------------
// 1. EMPLOYEE LOGIN -> Redirects to /portal
// ----------------------------------------------------------------------
export async function loginEmployee(formData: FormData): Promise<LoginError | undefined> {
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

  // For employees, we are currently checking the ID code directly. 
  // If you decide to hash employee IDs later, you would use bcrypt.compare here.
  if (!user) {
    return { error: 'Invalid surname or ID code. Please check and try again.' };
  }

  const cookieStore = await cookies();
  
  // Setting secure, httpOnly cookies for session management
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

  redirect('/portal');
}

// ----------------------------------------------------------------------
// 2. ADMIN LOGIN -> Redirects to /admin/employees
// ----------------------------------------------------------------------
export async function loginAdmin(formData: FormData): Promise<LoginError | undefined> {
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
    try {
      // Securely hash the password before saving to database
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
    } catch (error) {
      console.error("Failed to create admin:", error);
      return { error: 'Failed to create admin account. Please try again.' };
    }
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
  
  // Store session info in secure cookies
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

  redirect('/admin/employees');
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
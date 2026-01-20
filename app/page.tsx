import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;
  const role = cookieStore.get('session_role')?.value;

  if (!userId) {
    redirect('/login');
  }

  // Redirect to appropriate portal based on role
  if (role === 'ADMIN') {
    redirect('/admin/employees');
  } else {
    redirect('/portal');
  }
}
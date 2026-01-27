import { prisma } from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import EmployeeLayout from '@/app/components/EmployeeLayout';
import ProfileView from './ProfileView';
import { User } from 'lucide-react';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;
  if (!userId) return null;

  const rawUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' }
      },
      linkedGoogleAccount: true
    }
  });

  if (!rawUser) return null;

  const user = {
    ...rawUser,
    hourlyRate: rawUser.hourlyRate.toNumber()
  };

  const linkedGoogle = rawUser.linkedGoogleAccount
    ? {
        email: rawUser.linkedGoogleAccount.email,
        name: rawUser.linkedGoogleAccount.name,
        picture: rawUser.linkedGoogleAccount.picture,
        linkedAt: rawUser.linkedGoogleAccount.linkedAt.toISOString()
      }
    : null;

  return (
    <EmployeeLayout>
      {/* UPDATED: Added pt-24 here to force space at the top */}
      <div className="max-w-6xl mx-auto space-y-8 pt-15 px-6 pb-12">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 overflow-hidden">
             {user.photoUrl ? (
               <img src={user.photoUrl} className="w-full h-full object-cover" alt="Profile" />
             ) : (
               <User className="text-white" size={32} />
             )}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">Manage your info, schedule, and tasks.</p>
          </div>
        </div>

        <ProfileView
          user={user}
          tasks={user.tasks}
          linkedGoogle={linkedGoogle}
        />
      </div>
    </EmployeeLayout>
  );
}
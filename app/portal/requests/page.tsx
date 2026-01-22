import { prisma } from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import EmployeeLayout from '@/app/components/EmployeeLayout';
import ScheduleRequestSection from '../ScheduleRequestSection';
import LeaveSection from '../LeaveSection';

export default async function RequestsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      scheduleRequests: { orderBy: { createdAt: 'desc' } },
      leaveRequests: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!user) return null;

  return (
    <EmployeeLayout>
      <div className="space-y-8">
        <div><h1 className="text-3xl font-black tracking-tight">Requests</h1><p className="text-muted-foreground">Manage your schedule and leave applications.</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm"><h2 className="text-xl font-bold mb-6">File a Leave</h2><LeaveSection requests={user.leaveRequests} userEmail={user.email} /></div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm"><h2 className="text-xl font-bold mb-6">Request Schedule Change</h2><ScheduleRequestSection requests={user.scheduleRequests} userEmail={user.email} /></div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
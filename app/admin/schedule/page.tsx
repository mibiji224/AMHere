import AdminLayout from '@/app/components/AdminLayout';
import { prisma } from '@/app/lib/prisma';
import ScheduleContainer from './ScheduleContainer';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    include: { schedules: true },
    orderBy: { lastName: 'asc' }
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Work Schedules</h1>
        <p className="text-slate-500">Manage weekly recurring schedules and view daily rosters.</p>
      </div>

      <ScheduleContainer employees={employees} />
      
    </AdminLayout>
  );
}
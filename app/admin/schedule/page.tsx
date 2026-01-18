import AdminLayout from '@/app/components/AdminLayout';
import { prisma } from '@/app/lib/prisma';
import ScheduleContainer from './ScheduleContainer';
import ScheduleRequestsList from './ScheduleRequestsList'; 

// Ensure dynamic rendering
export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  // 1. Fetch Employees & Sanitize
  const rawEmployees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    include: { schedules: true },
    orderBy: { lastName: 'asc' }
  });

  const employees = rawEmployees.map((emp) => ({
    ...emp,
    hourlyRate: emp.hourlyRate.toNumber(), // Fix Decimal for employees
  }));

  // 2. Fetch Pending Requests & Sanitize
  const rawRequests = await prisma.scheduleChangeRequest.findMany({
    where: { status: 'PENDING' },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  // 👇 THIS FIXES THE NEW ERROR
  const pendingRequests = rawRequests.map((req) => ({
    ...req,
    user: {
      ...req.user,
      hourlyRate: req.user.hourlyRate.toNumber(), // Fix Decimal nested inside the user object
    }
  }));

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Work Schedules</h1>
        <p className="text-muted-foreground">Manage weekly recurring schedules and view daily rosters.</p>
      </div>

      {/* Now safe to pass because hourlyRate is a number */}
      <ScheduleRequestsList requests={pendingRequests} />

      <ScheduleContainer employees={employees} />
      
    </AdminLayout>
  );
}
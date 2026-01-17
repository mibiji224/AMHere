import AdminLayout from '@/app/components/AdminLayout';
import { prisma } from '@/app/lib/prisma';

export default async function SchedulePage() {
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    include: { schedules: true }
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Work Schedules</h1>
        <p className="text-slate-500">Manage onsite vs. remote days for your team.</p>
      </div>

      <div className="grid gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{emp.firstName} {emp.lastName}</h3>
              <p className="text-sm text-gray-500">{emp.position}</p>
            </div>
            <div className="flex gap-2">
               {/* We will build the "Edit Schedule" button next */}
               <button className="text-blue-600 bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
                 Manage Schedule
               </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
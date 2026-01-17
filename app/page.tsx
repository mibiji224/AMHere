import Link from 'next/link';
import { prisma } from './lib/prisma';
import AddEmployeeForm from './components/AddEmployeeForm';
import { logout } from './login/action';
import { deleteEmployee } from './actions';

export default async function Dashboard() {
  const totalEmployees = await prisma.user.count({
    where: { role: 'EMPLOYEE' }
  });

  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    include: { attendance: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Welcome back, Desiree</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/attendance"
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
              target="_blank"
            >
              Attendance ↗
            </Link>
            <form action={logout}>
              <button className="bg-white text-red-600 px-4 py-2 rounded-lg shadow-sm border border-red-100 hover:bg-red-50 transition font-medium">
                Logout
              </button>
            </form>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border flex flex-col justify-center min-w-[100px]">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Staff</span>
              <span className="text-xl font-bold text-blue-600 leading-none">{totalEmployees}</span>
            </div>
          </div>
        </div>

        <AddEmployeeForm />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-800">Payroll & Roster</h2>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Rate</th>
                <th className="px-6 py-3 font-medium">Total Hours</th>
                <th className="px-6 py-3 font-medium">Total Pay</th>
                <th className="px-6 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => {
                // ... (keep your existing calculation logic here) ...
                const totalMilliseconds = emp.attendance.reduce((acc, log) => {
                  if (log.timeOut) {
                    return acc + (new Date(log.timeOut).getTime() - new Date(log.timeIn).getTime());
                  }
                  return acc;
                }, 0);
                const totalHours = totalMilliseconds / (1000 * 60 * 60);
                const totalPay = totalHours * Number(emp.hourlyRate);
                const isWorking = emp.attendance.some(log => log.timeOut === null);

                return (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</div>
                      <div className="text-sm text-gray-400">{emp.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      ${Number(emp.hourlyRate).toFixed(2)}/hr
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700">
                      {totalHours.toFixed(2)} hrs
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">
                      ${totalPay.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isWorking ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                          ● Working
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Offline
                        </span>
                      )}
                    </td>

                    {/* 👇 NEW DELETE BUTTON COLUMN */}
                    <td className="px-6 py-4 text-right">
                      <form action={async () => {
                        'use server'
                        await deleteEmployee(emp.id)
                      }}>
                        <button className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
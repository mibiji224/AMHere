import { prisma } from '@/app/lib/prisma';
import AdminLayout from '@/app/components/AdminLayout';
import AddEmployeeForm from '@/app/components/AddEmployeeForm';
import { deleteEmployee } from '@/app/actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // 1. Get Totals
  const totalEmployees = await prisma.user.count({ where: { role: 'EMPLOYEE' } });
  
  // 2. Get Currently Active (Clocked In but NOT Clocked Out)
  const activeNow = await prisma.attendance.count({
    where: { 
      timeOut: null,
      date: {
        gte: new Date(new Date().setHours(0,0,0,0)) // Today starts at 00:00
      }
    }
  });

  const inactive = totalEmployees - activeNow;

  // 3. Get Employee List
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    include: { attendance: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminLayout>
      {/* 1. Header Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Staff Card */}
        <div className="bg-white dark:bg-card p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Staff</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{totalEmployees}</p>
        </div>

        {/* Working Now Card (Green Theme) */}
        <div className="bg-green-50/50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800 shadow-sm transition-colors">
          <p className="text-sm font-medium text-green-600 dark:text-green-400 uppercase">Working Now</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">{activeNow}</p>
        </div>

        {/* Inactive Card */}
        <div className="bg-white dark:bg-card p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Inactive / Off</p>
          <p className="text-3xl font-bold text-gray-400 dark:text-gray-500 mt-2">{inactive}</p>
        </div>
      </div>

      {/* 2. Add Employee Form */}
      <AddEmployeeForm />

      {/* 3. Employee Roster */}
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mt-8 transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800 dark:text-white">Employee Masterlist</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Position</th>
                  <th className="px-6 py-3 font-medium">Rate</th>
                  <th className="px-6 py-3 font-medium text-right">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {employees.map((emp) => {
                   // Check if working right now
                   const isWorking = emp.attendance.some(log => log.timeOut === null);

                   return (
                    <tr key={emp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">
                          {emp.firstName} {emp.lastName}
                          <div className="text-xs text-gray-400 dark:text-gray-500 font-normal">{emp.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-1 px-2 rounded-md text-xs font-medium">
                              {emp.position}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        ${Number(emp.hourlyRate).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isWorking ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 animate-pulse">
                            ● Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            Offline
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {/* VIEW BUTTON */}
                        <Link 
                          href={`/admin/employees/${emp.id}`}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded transition font-medium text-sm"
                        >
                          View
                        </Link>

                        {/* DELETE BUTTON */}
                        <form action={async () => {
                          'use server'
                          await deleteEmployee(emp.id)
                        }}>
                          <button className="text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded transition text-sm">
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
    </AdminLayout>
  );
}
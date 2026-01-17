import { prisma } from './lib/prisma';
import AdminLayout from './components/AdminLayout';
import AddEmployeeForm from './components/AddEmployeeForm';
import { deleteEmployee } from './actions';
import Link from 'next/link'

// Force dynamic because we need live stats
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // 1. Get Totals
  const totalEmployees = await prisma.user.count({ where: { role: 'EMPLOYEE' } });

  // 2. Get Currently Active (Clocked In but NOT Clocked Out)
  const activeNow = await prisma.attendance.count({
    where: {
      timeOut: null,
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today starts at 00:00
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
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground uppercase">Total Staff</p>
          <p className="text-3xl font-bold text-card-foreground mt-2">{totalEmployees}</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-green-100 bg-green-50/50 shadow-sm">
          <p className="text-sm font-medium text-green-600 uppercase">Working Now</p>
          <p className="text-3xl font-bold text-green-700 mt-2">{activeNow}</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground uppercase">Inactive / Off</p>
          <p className="text-3xl font-bold text-muted-foreground mt-2">{inactive}</p>
        </div>
      </div>

      {/* 2. Add Employee Form */}
      <AddEmployeeForm />

      {/* 3. Employee Roster */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-border bg-muted/50 flex justify-between items-center">
          <h2 className="font-semibold text-card-foreground">Employee Masterlist</h2>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border text-sm text-muted-foreground">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Position</th>
              <th className="px-6 py-3 font-medium">Rate</th>
              <th className="px-6 py-3 font-medium text-right">Status</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employees.map((emp) => {
              // Check if working right now
              const isWorking = emp.attendance.some(log => log.timeOut === null);

              return (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {emp.firstName} {emp.lastName}
                    <div className="text-xs text-gray-400 font-normal">{emp.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="bg-blue-50 text-blue-700 py-1 px-2 rounded-md text-xs font-medium">
                      {emp.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    ${Number(emp.hourlyRate).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isWorking ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                        ● Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Offline
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {/* 👇 NEW VIEW BUTTON */}
                    <Link
                      href={`/admin/employees/${emp.id}`}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded transition font-medium text-sm"
                    >
                      View
                    </Link>

                    {/* EXISTING DELETE BUTTON */}
                    <form action={async () => {
                      'use server'
                      await deleteEmployee(emp.id)
                    }}>
                      <button className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition text-sm">
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
    </AdminLayout>
  );
}
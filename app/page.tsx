import Link from 'next/link'; // ✅ Added the missing Link import
import { prisma } from './lib/prisma';
import AddEmployeeForm from './components/AddEmployeeForm';

export default async function Dashboard() {
  // 1. Fetch data directly from the database
  const totalEmployees = await prisma.user.count({
    where: { role: 'EMPLOYEE' }
  });
  
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    include: { attendance: true }, // Grab their attendance logs too
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {/* Header Section */}
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Welcome back, Desiree (CTO)</p>
          </div>
          
          <div className="flex gap-3">
            {/* New Button to Open Kiosk */}
            <Link 
              href="/attendance" 
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
              target="_blank"
            >
              Launch Kiosk ↗
            </Link>

            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border flex flex-col justify-center">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Staff</span>
              <span className="text-xl font-bold text-blue-600 leading-none">{totalEmployees}</span>
            </div>
          </div>
        </div>

        {/* Add Employee Form */}
        <AddEmployeeForm />

        {/* Employee Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-800">Employee Roster</h2>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Hourly Rate</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</div>
                    <div className="text-sm text-gray-400">{emp.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {emp.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    ${Number(emp.hourlyRate).toFixed(2)}/hr
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
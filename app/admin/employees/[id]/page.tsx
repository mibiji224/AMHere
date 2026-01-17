import { prisma } from '@/app/lib/prisma';
import AdminLayout from '@/app/components/AdminLayout';
import { notFound } from 'next/navigation';
import PrintButton from '@/app/components/PrintButton';

export const dynamic = 'force-dynamic';

// Correctly typed for Next.js 15
export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Employee & All Logs
  const employee = await prisma.user.findUnique({
    where: { id },
    include: {
      attendance: {
        orderBy: { date: 'desc' },
        include: { dailyLogs: true }
      }
    }
  });

  if (!employee) return notFound();

  // 2. Calculate Totals
  let totalHoursAllTime = 0;
  let totalPayAllTime = 0;

  const history = employee.attendance.map((record) => {
    let hours = 0;
    let pay = 0;
    let breakMins = 0;

    // Calculate Break
    if (record.breakStart && record.breakEnd) {
      const end = new Date(record.breakEnd).getTime();
      const start = new Date(record.breakStart).getTime();
      breakMins = Math.floor((end - start) / 60000);
    }

    // Calculate Work
    if (record.timeOut) {
      const outTime = new Date(record.timeOut).getTime();
      const inTime = new Date(record.timeIn).getTime();
      
      const durationMs = outTime - inTime;
      const durationHours = durationMs / (1000 * 60 * 60);
      
      hours = durationHours;
      pay = hours * Number(employee.hourlyRate);

      totalHoursAllTime += hours;
      totalPayAllTime += pay;
    }

    return { ...record, hours, pay, breakMins };
  });

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{employee.firstName} {employee.lastName}</h1>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide print:border print:border-gray-300">
                {employee.employeeId}
              </span>
            </div>
            <p className="text-gray-500 mt-1">{employee.position} • {employee.email}</p>
          </div>
          <PrintButton />
        </div>

        {/* STATS CARDS (Hidden when printing) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hourly Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">${Number(employee.hourlyRate).toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Hours</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{totalHoursAllTime.toFixed(1)} hrs</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Earnings</p>
            <p className="text-3xl font-bold text-green-600 mt-2">${totalPayAllTime.toFixed(2)}</p>
          </div>
        </div>

        {/* ATTENDANCE TABLE */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center print:bg-white print:border-b-2 print:border-black">
            <h2 className="font-semibold text-gray-800">Attendance History</h2>
            <span className="text-xs text-gray-400 print:text-black">Generated via AM-HERE</span>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 bg-gray-50/30 print:bg-white print:border-black">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Time In</th>
                <th className="px-6 py-3 font-medium">Time Out</th>
                <th className="px-6 py-3 font-medium text-center">Break</th>
                <th className="px-6 py-3 font-medium text-right">Total Hours</th>
                <th className="px-6 py-3 font-medium text-right">Daily Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 print:divide-gray-300">
              {history.map((day) => (
                <tr key={day.id} className="hover:bg-gray-50/50 transition print:hover:bg-white">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(day.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {day.timeOut 
                      ? new Date(day.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : <span className="text-green-600 font-medium animate-pulse print:hidden">Active</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-center">
                    {day.breakMins > 0 ? (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        day.breakMins > 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      } print:bg-transparent print:text-black`}>
                        {day.breakMins}m
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-gray-700">
                    {day.hours > 0 ? day.hours.toFixed(2) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {day.pay > 0 ? `$${day.pay.toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* FOOTER TOTALS */}
            <tfoot className="hidden print:table-footer-group border-t-2 border-black">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-right font-bold uppercase text-xs">Total Payout</td>
                <td className="px-6 py-4 text-right font-bold">{totalHoursAllTime.toFixed(2)} hrs</td>
                <td className="px-6 py-4 text-right font-bold text-lg">${totalPayAllTime.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* SIGNATURE AREA (Only shows on print) */}
        <div className="hidden print:flex justify-between mt-16 px-8">
            <div className="text-center">
                <div className="border-t border-black w-48 pt-2">Employee Signature</div>
            </div>
            <div className="text-center">
                <div className="border-t border-black w-48 pt-2">Admin Approval</div>
            </div>
        </div>

      </div>
    </AdminLayout>
  );
}
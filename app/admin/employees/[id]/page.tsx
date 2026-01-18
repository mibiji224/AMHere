import { prisma } from '@/app/lib/prisma';
import AdminLayout from '@/app/components/AdminLayout';
import { notFound } from 'next/navigation';
import PrintButton from '@/app/components/PrintButton';
import PayslipTemplate from '@/app/components/PayslipTemplate'; 

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailsPage({ params }: PageProps) {
  // 1. Await Params
  const { id } = await params;

  // 2. Fetch Employee Data
  const employee = await prisma.user.findUnique({
    where: { id },
    include: {
      attendance: {
        orderBy: { date: 'desc' },
        take: 30 // Last 30 records
      }
    }
  });

  if (!employee) return notFound();

  // 3. Calculate Pay & Hours
  const hourlyRate = employee.hourlyRate.toNumber();
  let totalHours = 0;
  
  const history = employee.attendance.map(record => {
    let dailyHours = 0;
    
    // Only calculate if they have clocked out
    if (record.timeIn && record.timeOut) {
      const start = new Date(record.timeIn).getTime();
      const end = new Date(record.timeOut).getTime();
      
      // Calculate Break Duration
      let breakMs = 0;
      if (record.breakStart && record.breakEnd) {
        breakMs = new Date(record.breakEnd).getTime() - new Date(record.breakStart).getTime();
      }
      
      // Net Duration in Hours
      dailyHours = ((end - start) - breakMs) / (1000 * 60 * 60);
    }

    // Add to Total
    totalHours += dailyHours;

    return {
      ...record,
      dailyHours,
      dailyPay: dailyHours * hourlyRate
    };
  });

  const totalEarnings = totalHours * hourlyRate;

  return (
    <>
      {/* =========================================================
          VIEW 1: THE DASHBOARD (Hidden when printing)
      ========================================================= */}
      <div className="print:hidden">
        <AdminLayout>
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-foreground">
                  {employee.firstName} {employee.lastName}
                </h1>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold border border-primary/20">
                  {employee.employeeId}
                </span>
              </div>
              <p className="text-muted-foreground">{employee.position} • {employee.email}</p>
            </div>

            {/* Print Button (Client Component) */}
            <PrintButton />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Rate Card */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Hourly Rate</h3>
              <div className="text-3xl font-bold text-foreground">
                ${hourlyRate.toFixed(2)}
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Hours</h3>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {totalHours.toFixed(2)} hrs
              </div>
            </div>

            {/* Earnings Card */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Earnings</h3>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${totalEarnings.toFixed(2)}
              </div>
            </div>

          </div>

          {/* Attendance Table */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-foreground">Attendance History</h3>
              <span className="text-xs text-muted-foreground">Generated via AM-HERE</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Time In</th>
                    <th className="px-6 py-3">Time Out</th>
                    <th className="px-6 py-3">Break</th>
                    <th className="px-6 py-3 text-right">Total Hours</th>
                    <th className="px-6 py-3 text-right">Daily Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((log) => (
                    <tr key={log.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {log.timeIn ? new Date(log.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {!log.timeOut ? (
                          <span className="text-green-600 dark:text-green-400 font-bold text-xs bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">Active</span>
                        ) : (
                          <span className="text-muted-foreground">
                            {new Date(log.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {log.breakStart && log.breakEnd ? (
                          <span className="bg-secondary px-2 py-1 rounded text-xs">
                            {Math.round((new Date(log.breakEnd).getTime() - new Date(log.breakStart).getTime()) / 60000)}m
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-foreground">
                        {log.dailyHours > 0 ? log.dailyHours.toFixed(2) : '–'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-foreground">
                        {log.dailyPay > 0 ? `$${log.dailyPay.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                  
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </AdminLayout>
      </div>

      {/* =========================================================
          VIEW 2: THE PAYSLIP RECEIPT (Visible ONLY when printing)
      ========================================================= */}
      <div id="payslip-wrapper" className="hidden">
        <PayslipTemplate 
          employee={employee}
          totalHours={totalHours}
          totalEarnings={totalEarnings}
          history={history}
        />
      </div>

    </>
  );
}
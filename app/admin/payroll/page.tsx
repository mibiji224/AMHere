import { prisma } from '@/app/lib/prisma';
import AdminLayout from '@/app/components/AdminLayout';

export const dynamic = 'force-dynamic';

export default async function PayrollPage() {
  // 1. Determine the Date Range (Current Month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // 2. Fetch Employees with Attendance for this Month
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    include: {
      attendance: {
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }
    },
    orderBy: { lastName: 'asc' }
  });

  // 3. Calculate Payroll Data
  let grandTotalPayroll = 0;
  let grandTotalHours = 0;

  const payrollData = employees.map((emp) => {
    const hourlyRate = emp.hourlyRate.toNumber();
    let totalHours = 0;

    // Sum up hours for this employee
    emp.attendance.forEach((record) => {
      if (record.timeIn && record.timeOut) {
        const start = new Date(record.timeIn).getTime();
        const end = new Date(record.timeOut).getTime();
        
        let breakMs = 0;
        if (record.breakStart && record.breakEnd) {
          breakMs = new Date(record.breakEnd).getTime() - new Date(record.breakStart).getTime();
        }

        const hours = ((end - start) - breakMs) / (1000 * 60 * 60);
        totalHours += hours;
      }
    });

    const grossPay = totalHours * hourlyRate;

    // Add to Grand Totals
    grandTotalPayroll += grossPay;
    grandTotalHours += totalHours;

    return {
      ...emp,
      totalHours,
      grossPay,
      hourlyRate // pass converted number
    };
  });

  // Format Currency Helper
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <AdminLayout>
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Payroll Report</h1>
        <p className="text-muted-foreground">
          Summary for {startOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Payroll Cost</h3>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{formatMoney(grandTotalPayroll)}</div>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Hours Worked</h3>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{grandTotalHours.toFixed(1)} hrs</div>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Employees Paid</h3>
          <div className="text-3xl font-bold text-foreground">{payrollData.length}</div>
        </div>
      </div>

      {/* PAYROLL TABLE */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-bold border-b border-border">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4 text-right">Hourly Rate</th>
                <th className="px-6 py-4 text-right">Total Hours</th>
                <th className="px-6 py-4 text-right">Gross Pay</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payrollData.map((emp) => (
                <tr key={emp.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4 font-bold text-foreground">
                    {emp.firstName} {emp.lastName}
                    <div className="text-[10px] text-muted-foreground font-normal">{emp.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {emp.position}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                    ${emp.hourlyRate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600 dark:text-blue-400">
                    {emp.totalHours.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400 text-base">
                    {formatMoney(emp.grossPay)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-2 py-1 rounded text-[10px] font-bold bg-secondary text-muted-foreground border border-border">
                      CALCULATED
                    </span>
                  </td>
                </tr>
              ))}

              {payrollData.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No records found for this month.
                  </td>
                </tr>
              )}
            </tbody>
            
            {/* TABLE FOOTER TOTALS */}
            {payrollData.length > 0 && (
              <tfoot className="bg-secondary/30 font-bold text-foreground border-t-2 border-border">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right uppercase text-xs tracking-wider">Totals</td>
                  <td className="px-6 py-4 text-right">{grandTotalHours.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-green-600 dark:text-green-400">{formatMoney(grandTotalPayroll)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

    </AdminLayout>
  );
}
import { prisma } from '@/app/lib/prisma';
import AdminLayout from '@/app/components/AdminLayout';
import { calculatePayroll } from '@/app/lib/payrollHelper';

export const dynamic = 'force-dynamic';

export default async function PayrollPage() {
  // 1. Calculate Current Week Range (Sunday to Saturday)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0,0,0,0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23,59,59,999);

  // 2. Fetch Data
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    include: {
      attendance: {
        where: { date: { gte: startOfWeek, lte: endOfWeek } }
      }
    },
    orderBy: { lastName: 'asc' }
  });

  // 3. Process Data
  let companyTotalGross = 0;
  let companyTotalNet = 0;
  let companyTotalDeductions = 0;

  const payrollRows = employees.map(emp => {
    const stats = calculatePayroll(emp, startOfWeek, endOfWeek);
    
    companyTotalGross += stats.grossPay;
    companyTotalNet += stats.netPay;
    companyTotalDeductions += stats.totalDeduction;

    return { ...emp, stats };
  }).filter(row => row.stats.logCount > 0); // Only show active employees

  // Helper
  const formatMoney = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Weekly Payroll Report</h1>
        <p className="text-muted-foreground text-sm">
          Period: {startOfWeek.toLocaleDateString()} — {endOfWeek.toLocaleDateString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-xs font-bold text-muted-foreground uppercase">Total Employees to Pay</h3>
          <div className="text-3xl font-bold text-foreground">{payrollRows.length}</div>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-xs font-bold text-muted-foreground uppercase">Total Gross Pay</h3>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatMoney(companyTotalGross)}</div>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-xs font-bold text-muted-foreground uppercase">Total Net Pay</h3>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{formatMoney(companyTotalNet)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 border-b border-border text-muted-foreground font-bold">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4 text-right">Gross Pay</th>
              <th className="px-6 py-4 text-right text-red-500">Deductions</th>
              <th className="px-6 py-4 text-right">Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payrollRows.map((row) => (
              <tr key={row.id}>
                <td className="px-6 py-4 font-bold text-foreground">
                  {row.firstName} {row.lastName}
                  <div className="text-[10px] text-muted-foreground font-normal">{row.position}</div>
                </td>
                <td className="px-6 py-4 text-right font-mono text-foreground">
                  {formatMoney(row.stats.grossPay)}
                </td>
                <td className="px-6 py-4 text-right font-mono text-red-500 font-bold">
                  {row.stats.totalDeduction > 0 ? `-${formatMoney(row.stats.totalDeduction)}` : '-'}
                </td>
                <td className="px-6 py-4 text-right font-mono text-green-600 dark:text-green-400 font-bold text-base">
                  {formatMoney(row.stats.netPay)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
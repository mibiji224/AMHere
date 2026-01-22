import { prisma } from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import EmployeeLayout from '@/app/components/EmployeeLayout';
import PayslipTemplate from '@/app/components/PayslipTemplate';
import PrintButton from '@/app/components/PrintButton';

export const dynamic = 'force-dynamic';

export default async function PayslipsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const employeeData = { ...user, hourlyRate: user.hourlyRate.toNumber() };
  const payslip = {
    period: 'Jan 15 - Jan 21, 2026',
    totalHours: 40.0,
    totalEarnings: employeeData.hourlyRate * 40,
    history: []
  };

  return (
    <EmployeeLayout>
      <div className="space-y-8">
        <div><h1 className="text-3xl font-black tracking-tight">My Payslips</h1><p className="text-muted-foreground">View and print your weekly salary details.</p></div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div><h3 className="font-bold text-lg">{payslip.period}</h3><p className="text-muted-foreground text-sm">Issued on {new Date().toLocaleDateString()}</p></div>
          <div className="flex items-center gap-6">
            <div className="text-right"><p className="text-xs text-muted-foreground font-bold uppercase">Net Pay</p><span className="font-black text-2xl text-green-600">${payslip.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            <PrintButton />
          </div>
        </div>
        <div className="hidden print:block print:absolute print:inset-0 print:bg-white print:z-[9999]">
          <PayslipTemplate employee={employeeData} totalHours={payslip.totalHours} totalEarnings={payslip.totalEarnings} history={payslip.history} />
        </div>
      </div>
    </EmployeeLayout>
  );
}
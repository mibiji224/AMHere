import { prisma } from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import EmployeeLayout from '@/app/components/EmployeeLayout';
import PayslipTemplate from '@/app/components/PayslipTemplate';
import PrintButton from '@/app/components/PrintButton';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------
// 🔧 CONFIGURATION
// ---------------------------------------------------------
const USD_TO_PHP_RATE = 58.50; 

export default async function PayslipsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;
  if (!userId) return null;

  // 1. Fetch User Data
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  // 2. Determine "Current Week" (Monday to Sunday)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // 3. Fetch Real Attendance for this week
  const logs = await prisma.attendance.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startOfWeek,
        lte: endOfWeek
      },
      timeOut: { not: null }
    },
    orderBy: { date: 'asc' }
  });

  // 4. Calculate Real Hours & Pay (USD)
  let totalHours = 0;

  const history = logs.map(log => {
    if (!log.timeIn || !log.timeOut) return null;

    let durationMs = log.timeOut.getTime() - log.timeIn.getTime();

    if (log.breakStart && log.breakEnd) {
      const breakMs = log.breakEnd.getTime() - log.breakStart.getTime();
      durationMs -= breakMs;
    }

    const hours = durationMs / (1000 * 60 * 60);
    totalHours += hours;

    return {
      id: log.id,
      date: log.date,
      timeIn: log.timeIn,
      timeOut: log.timeOut,
      dailyHours: hours
    };
  }).filter(item => item !== null);

  const hourlyRateUSD = user.hourlyRate.toNumber();
  const grossPayUSD = totalHours * hourlyRateUSD;
  
  // 5. Calculate PHP Conversion
  const grossPayPHP = grossPayUSD * USD_TO_PHP_RATE;

  // 6. Prepare Data Object
  const payslipData = {
    period: `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`,
    totalHours: totalHours,
    grossPayUSD: grossPayUSD,
    grossPayPHP: grossPayPHP,
    history: history as any[] 
  };

  const employeeData = {
    ...user,
    hourlyRate: hourlyRateUSD
  };

  return (
    <EmployeeLayout>
      <div className="space-y-8 pt-15">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">My Payslips</h1>
          <p className="text-muted-foreground">View and print your weekly salary details.</p>
        </div>

        {/* Payslip Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* LEFT SIDE: Info Only */}
          <div className="flex flex-col gap-1 items-start">
            <h3 className="font-bold text-lg text-foreground">Current Week: {payslipData.period}</h3>
            <p className="text-muted-foreground text-sm">
              Status: <span className="text-green-600 dark:text-green-400 font-bold">Accumulating</span>
            </p>
          </div>
          
          {/* RIGHT SIDE: Earnings + Print Button */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Estimated Net Pay</p>
              
              {/* PRIMARY CURRENCY (USD) - ADAPTED FOR DARK MODE */}
              <div className="font-black text-4xl text-green-600 dark:text-green-400 leading-none">
                ${payslipData.grossPayUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              
              {/* SECONDARY CURRENCY (PHP) */}
              <div className="text-sm font-bold text-muted-foreground mt-1">
                ≈ ₱{payslipData.grossPayPHP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              
              <p className="text-[10px] text-muted-foreground mt-1 opacity-70">
                Based on {totalHours.toFixed(2)} hrs work ($1 = ₱{USD_TO_PHP_RATE})
              </p>
            </div>

            {/* BUTTON PLACED HERE ON THE RIGHT */}
            <div className="border-l border-border pl-6">
               <PrintButton />
            </div>
          </div>
        </div>

        {/* History Table Preview - ADAPTED BACKGROUND */}
        <div className="bg-secondary/30 dark:bg-secondary/10 rounded-xl p-6 border border-transparent dark:border-border">
          <h4 className="font-bold text-sm mb-4 uppercase text-muted-foreground">Breakdown</h4>
          <div className="space-y-2">
            {history.length > 0 ? history.map((day) => (
              <div key={day.id} className="flex justify-between text-sm py-2 border-b border-border last:border-0 text-foreground">
                <span>{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="font-mono text-foreground">{day.dailyHours.toFixed(2)} hrs</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground italic">No completed shifts recorded for this week yet.</p>
            )}
          </div>
        </div>

        {/* HIDDEN TEMPLATE (Only Visible when Printing) */}
        <div className="hidden print:block print:absolute print:inset-0 print:bg-white print:z-[9999]">
          <PayslipTemplate 
            employee={employeeData} 
            totalHours={payslipData.totalHours}
            totalEarnings={payslipData.grossPayUSD} 
            history={payslipData.history}
          />
        </div>

      </div>
    </EmployeeLayout>
  );
}
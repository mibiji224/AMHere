import { prisma } from '@/app/lib/prisma';
import AdminLayout from '@/app/components/AdminLayout';
import { notFound } from 'next/navigation';
import { User, Mail, Briefcase } from 'lucide-react';
import PrintButton from '@/app/components/PrintButton';
import PayslipTemplate from '@/app/components/PayslipTemplate'; // 👈 Import this!

// 1. Await params properly
export default async function EmployeeDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const employee = await prisma.user.findUnique({
    where: { id: id },
    include: {
      attendance: {
        orderBy: { date: 'desc' },
        take: 30 // Last 30 days
      }
    }
  });

  if (!employee) notFound();

  // 2. Prepare Data for Calculations
  let totalHours = 0;
  
  // Format history for the Template
  const historyData = employee.attendance.map((log) => {
    let dailyHours = 0;
    if (log.timeIn && log.timeOut) {
      let duration = log.timeOut.getTime() - log.timeIn.getTime();
      if (log.breakStart && log.breakEnd) {
        duration -= (log.breakEnd.getTime() - log.breakStart.getTime());
      }
      dailyHours = duration / (1000 * 60 * 60);
      totalHours += dailyHours;
    }

    return {
      id: log.id,
      date: log.date,
      timeIn: log.timeIn,
      timeOut: log.timeOut,
      dailyHours: dailyHours
    };
  });

  const hourlyRate = employee.hourlyRate.toNumber();
  const totalEarnings = totalHours * hourlyRate;

  // 3. Prepare the Employee Object for the Template
  const employeeForTemplate = {
    ...employee,
    hourlyRate: hourlyRate
  };

  return (
    <AdminLayout>
      <div className="space-y-8 p-8 max-w-6xl mx-auto relative">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
              {employee.photoUrl ? (
                <img 
                  src={employee.photoUrl} 
                  alt={`${employee.firstName} ${employee.lastName}`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={32} className="text-gray-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-foreground">
                  {employee.firstName} {employee.lastName}
                </h1>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase tracking-wider">
                  {employee.employeeId}
                </span>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Briefcase size={14} /> {employee.position} 
                <span className="text-gray-300">•</span> 
                <Mail size={14} /> {employee.email}
              </p>
            </div>
          </div>
          <PrintButton />
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
             <p className="text-xs font-bold text-muted-foreground uppercase">Hourly Rate</p>
             <h3 className="text-3xl font-black mt-1">${hourlyRate.toFixed(2)}</h3>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
             <p className="text-xs font-bold text-muted-foreground uppercase">Total Hours (30 Days)</p>
             <h3 className="text-3xl font-black text-blue-600 mt-1">{totalHours.toFixed(2)} hrs</h3>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
             <p className="text-xs font-bold text-muted-foreground uppercase">Total Earnings (Est.)</p>
             <h3 className="text-3xl font-black text-green-600 mt-1">${totalEarnings.toFixed(2)}</h3>
          </div>
        </div>

        {/* --- ATTENDANCE HISTORY TABLE (Screen Only) --- */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-lg">Attendance History</h3>
            <span className="text-xs text-muted-foreground">Generated via AM-HERE</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Time In</th>
                  <th className="px-6 py-4">Time Out</th>
                  <th className="px-6 py-4">Break</th>
                  <th className="px-6 py-4 text-right">Hours</th>
                  <th className="px-6 py-4 text-right">Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {historyData.map((log) => (
                  <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-bold">{new Date(log.date).toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'})}</td>
                    <td className="px-6 py-4 text-muted-foreground">{log.timeIn ? new Date(log.timeIn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '-'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{log.timeOut ? new Date(log.timeOut).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '-'}</td>
                    <td className="px-6 py-4">-</td> 
                    <td className="px-6 py-4 text-right font-bold">{log.dailyHours > 0 ? log.dailyHours.toFixed(2) : '-'}</td>
                    <td className="px-6 py-4 text-right font-black text-foreground">${(log.dailyHours * hourlyRate).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 👇 THIS IS THE SECRET SAUCE 
          This section is HIDDEN on screen (`hidden`), 
          but VISIBLE when printing (`print:block`).
          It covers the entire page (`absolute inset-0 z-[9999]`).
        */}
        <div className="hidden print:block print:absolute print:inset-0 print:bg-white print:z-[9999]">
          <PayslipTemplate 
            employee={employeeForTemplate}
            totalHours={totalHours}
            totalEarnings={totalEarnings}
            history={historyData}
          />
        </div>

      </div>
    </AdminLayout>
  );
} 
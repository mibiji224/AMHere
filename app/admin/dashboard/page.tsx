import { prisma } from '@/app/lib/prisma';
import AdminLayout from '@/app/components/AdminLayout';
import DateFilter from './DateFilter'; // 👈 Import the new component
import { 
  Users, 
  TrendingUp, 
  Activity, 
  ArrowUpRight
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// 1. Accept searchParams prop
export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await searchParams in Next.js 15/16+
  const params = await searchParams;
  const dateParam = typeof params.date === 'string' ? params.date : undefined;

  // 2. SETUP DATES BASED ON SELECTION
  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  
  // Normalize to start of day (00:00:00)
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // For the chart (Always show 7 days leading up to the SELECTED date)
  const sevenDaysAgo = new Date(startOfDay);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  // 3. FETCH DATA
  const totalEmployees = await prisma.user.count({ 
    where: { role: 'EMPLOYEE', isActive: true } 
  });

  // Count attendance specifically for the SELECTED DATE range
  const presentCount = await prisma.attendance.count({
    where: {
      date: {
        gte: startOfDay,
        lt: endOfDay
      }
    }
  });

  const pendingRequests = await prisma.leaveRequest.count({ 
    where: { status: 'PENDING' } 
  });

  const attendanceRate = totalEmployees > 0 
    ? ((presentCount / totalEmployees) * 100).toFixed(1) 
    : '0.0';

  // Chart Data (Range relative to selected date)
  const attendanceStats = await prisma.attendance.groupBy({
    by: ['date'],
    _count: { id: true },
    where: {
      date: { 
        gte: sevenDaysAgo,
        lte: endOfDay
      }
    },
    orderBy: { date: 'asc' }
  });

  const chartData = attendanceStats.map(stat => ({
    count: stat._count.id,
    height: Math.min((stat._count.id / (totalEmployees || 1)) * 100, 100),
    day: new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' })
  }));

  // Helper to check if viewing today
  const isViewingToday = new Date().toDateString() === startOfDay.toDateString();

  return (
    <AdminLayout>
      <div className="p-8 space-y-8 bg-background min-h-screen">
        
        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Analytics</h1>
            <p className="text-muted-foreground text-sm">
              {isViewingToday 
                ? "Live system-wide workforce data." 
                : `Viewing historical data for ${startOfDay.toLocaleDateString()}.`}
            </p>
          </div>
          
          {/* 👈 USE THE NEW DATE FILTER COMPONENT */}
          <DateFilter />
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TOTAL STAFF */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
                <Users size={20} />
              </div>
              <span className="flex items-center text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> Active
              </span>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase">Total Staff</p>
            <h2 className="text-3xl font-black mt-1">{totalEmployees}</h2>
          </div>

          {/* PENDING REQUESTS */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                <Activity size={20} />
              </div>
              {pendingRequests > 0 && (
                <span className="flex items-center text-amber-600 text-xs font-bold bg-amber-500/10 px-2 py-1 rounded-full animate-pulse">
                  Action Needed
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase">Pending Requests</p>
            <h2 className="text-3xl font-black mt-1">{pendingRequests}</h2>
          </div>

          {/* ATTENDANCE RATE (Dynamic based on date) */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-500/10 text-green-600 rounded-xl">
                <TrendingUp size={20} />
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                {presentCount} / {totalEmployees} Present
              </span>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase">
              {isViewingToday ? "Attendance Rate" : "Historical Rate"}
            </p>
            <h2 className="text-3xl font-black mt-1">{attendanceRate}%</h2>
            
            <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
               <div 
                 className="bg-green-500 h-full rounded-full transition-all duration-1000" 
                 style={{ width: `${attendanceRate}%` }} 
               />
            </div>
          </div>
        </div>

        {/* CHART SECTION */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-lg">
                Attendance Trends 
                <span className="text-muted-foreground text-sm font-normal ml-2">
                  (7 Days ending {startOfDay.toLocaleDateString()})
                </span>
              </h3>
            </div>
            
            <div className="h-64 w-full flex items-end gap-4 relative border-b border-l border-border/50 pb-2 pl-2">
               {chartData.length > 0 ? chartData.map((data, i) => (
                 <div key={i} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                    <div 
                      className="w-full max-w-[50px] bg-primary/20 hover:bg-primary transition-all rounded-t-md cursor-pointer" 
                      style={{ height: `${data.height}%` }}
                    />
                    <span className="absolute -top-8 text-[10px] font-bold opacity-0 group-hover:opacity-100 bg-foreground text-background px-2 py-1 rounded transition-opacity whitespace-nowrap z-10">
                      {data.count} Present
                    </span>
                    <span className="mt-4 text-[10px] font-bold text-muted-foreground uppercase">{data.day}</span>
                 </div>
               )) : (
                 <div className="w-full h-full flex items-center justify-center text-muted-foreground italic text-sm">
                   No data found for this period
                 </div>
               )}
            </div>
        </div>
      </div>
    </AdminLayout>
  );
}
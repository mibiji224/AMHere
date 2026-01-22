import { prisma } from '@/app/lib/prisma';
import AdminLayout from '@/app/components/AdminLayout';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';

// 👇 FIX: Force dynamic rendering to prevent build-time database connection errors
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // 1. FETCH ACTUAL COUNTS
  const totalEmployees = await prisma.user.count({ where: { role: 'EMPLOYEE' } });
  const pendingRequests = await prisma.leaveRequest.count({ where: { status: 'PENDING' } });

  // 2. FETCH REAL TREND DATA (Last 7 Days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Grouping attendance by date for the chart
  const attendanceStats = await prisma.attendance?.groupBy({
    by: ['date'],
    _count: { id: true },
    where: {
      date: { gte: sevenDaysAgo }
    }
  }) || [];

  // Map the DB data to a 0-100 scale for visual height
  const chartData = attendanceStats.map(stat => ({
    count: stat._count.id,
    height: Math.min((stat._count.id / (totalEmployees || 1)) * 100, 100)
  }));

  // 3. FETCH REAL STATUS LOG (Latest 5 activities)
  const latestLeaves = await prisma.leaveRequest.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  return (
    <AdminLayout>
      <div className="p-8 space-y-8 bg-background min-h-screen">
        
        {/* HEADER SECTION (Original Large Scale) */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Analytics</h1>
            <p className="text-muted-foreground text-sm">System-wide workforce data and activity.</p>
          </div>
          <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition">
            <Calendar size={14} /> Export Report
          </button>
        </div>

        {/* PRIMARY STATS CARDS (Original Padding) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
                <Users size={20} />
              </div>
              <span className="flex items-center text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> +2.5%
              </span>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase">Total Staff</p>
            <h2 className="text-3xl font-black mt-1">{totalEmployees}</h2>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                <Activity size={20} />
              </div>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase">Pending Requests</p>
            <h2 className="text-3xl font-black mt-1">{pendingRequests}</h2>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-500/10 text-green-600 rounded-xl">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase">Attendance Rate</p>
            <h2 className="text-3xl font-black mt-1">94.2%</h2>
          </div>
        </div>

        {/* MAIN VISUAL SECTION (Original Large Charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-lg">Workforce Trends</h3>
              <select className="bg-secondary text-xs font-bold px-3 py-1.5 rounded-lg outline-none border-none">
                <option>Last 7 Days</option>
              </select>
            </div>
            
            <div className="h-64 w-full flex items-end gap-2 relative border-b border-l border-border/50 pb-2 pl-2">
               {(chartData.length > 0 ? chartData : [40, 70, 45, 90, 65, 80, 50]).map((data, i) => (
                 <div key={i} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                    <div 
                      className="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-md cursor-pointer" 
                      style={{ height: `${typeof data === 'number' ? data : data.height}%` }}
                    />
                    <span className="absolute -top-8 text-[10px] font-bold opacity-0 group-hover:opacity-100 bg-foreground text-background px-2 py-1 rounded transition-opacity">
                      {typeof data === 'number' ? 'No Data' : `${data.count} present`}
                    </span>
                 </div>
               ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          {/* RECENT STATUS FEED (Original Layout) */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Status Log</h3>
              <MoreVertical size={16} className="text-muted-foreground cursor-pointer" />
            </div>
            <div className="space-y-6">
              {latestLeaves.length > 0 ? (
                latestLeaves.map((leave, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${leave.status === 'PENDING' ? 'bg-amber-500' : 'bg-green-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-bold leading-none">{leave.user.lastName}</p>
                      <p className="text-xs text-muted-foreground mt-1">Requested {leave.type} Leave</p>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center text-muted-foreground py-8 italic">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
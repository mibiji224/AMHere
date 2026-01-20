// filepath: app/admin/employees/page.tsx
import { prisma } from '@/app/lib/prisma';
import AdminLayout from '@/app/components/AdminLayout';
import { 
  Users, 
  Clock, 
  UserMinus, 
  TrendingUp, 
  Briefcase,
  Calendar,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EmployeesDashboard() {
  // 1. DATA FETCHING
  // Get core headcount
  const totalEmployees = await prisma.user.count({ where: { role: 'EMPLOYEE' } });
  
  // Get active attendance (Clocked in today but no timeOut)
  const activeNow = await prisma.attendance.count({
    where: { 
      timeOut: null,
      date: { gte: new Date(new Date().setHours(0,0,0,0)) }
    }
  });

  // Aggregate employees by position for the department chart
  const deptData = await prisma.user.groupBy({
    by: ['position'],
    where: { role: 'EMPLOYEE' },
    _count: { position: true }
  });

  // Calculate stats
  const inactive = totalEmployees - activeNow;
  const attendanceRate = totalEmployees > 0 ? Math.round((activeNow / totalEmployees) * 100) : 0;

  return (
    <AdminLayout>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workforce Overview</h1>
          <p className="text-gray-500 dark:text-gray-400">Real-time HR analytics and department health</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/" 
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Manage Staff
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* STAT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Headcount" 
          value={totalEmployees} 
          icon={<Users className="w-5 h-5" />}
          trend="Total registered"
          color="blue"
        />
        <StatCard 
          title="Active Now" 
          value={activeNow} 
          icon={<Clock className="w-5 h-5" />}
          trend={`${attendanceRate}% Daily Rate`}
          color="green"
        />
        <StatCard 
          title="Off Duty" 
          value={inactive} 
          icon={<UserMinus className="w-5 h-5" />}
          trend="Inactive / On Leave"
          color="orange"
        />
        <StatCard 
          title="Avg. Performance" 
          value="94%" 
          icon={<TrendingUp className="w-5 h-5" />}
          trend="+2.1% from last month"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* DEPARTMENT DISTRIBUTION CHART */}
        <div className="lg:col-span-1 bg-white dark:bg-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              Department Split
            </h3>
          </div>
          
          <div className="space-y-5">
            {deptData.length > 0 ? (
              deptData.map((dept) => {
                const percentage = Math.round((dept._count.position / totalEmployees) * 100);
                return (
                  <div key={dept.position || 'Unassigned'}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        {dept.position || 'General Staff'}
                      </span>
                      <span className="text-gray-900 dark:text-white font-bold">{dept._count.position}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-10">No department data found.</p>
            )}
          </div>
        </div>

        {/* WEEKLY ACTIVITY VISUALIZATION */}
        <div className="lg:col-span-2 bg-white dark:bg-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Weekly Attendance Trends
            </h3>
            <span className="text-xs text-gray-400">Last 7 Days</span>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-3 px-2">
             {/* Mock visual data - for a production app, you would map real daily counts here */}
             {[35, 62, 48, 85, 72, 20, 15].map((height, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="relative w-full">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {height} Check-ins
                    </div>
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        height > 50 ? 'bg-blue-500 hover:bg-blue-400' : 'bg-blue-200 dark:bg-blue-900/40 hover:bg-blue-300'
                      }`} 
                      style={{ height: `${height * 2}px` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
               </div>
             ))}
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center gap-4 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Export Payroll Data</span>
        </div>
        <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center gap-4 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Schedule Review</span>
        </div>
        <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center gap-4 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Policy Documents</span>
        </div>
      </div>
    </AdminLayout>
  );
}

// STYLED COMPONENT: STAT CARD
function StatCard({ title, value, icon, trend, color }: any) {
  const colorMap: any = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800",
  };

  return (
    <div className="bg-white dark:bg-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-transform hover:scale-[1.02]">
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
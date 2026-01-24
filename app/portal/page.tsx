import { prisma } from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import EmployeeLayout from '@/app/components/EmployeeLayout';
import { ClockInButton, ClockOutButton, toggleBreak } from './actions';
import { Coffee, TrendingUp, CalendarDays, MapPin, History, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EmployeePortal() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;

  if (!userId) return <div>Unauthorized</div>;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return <div>User not found</div>;

  // 1. GET TODAY'S DATA
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayLog = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  const isClockedIn = !!todayLog?.timeIn && !todayLog?.timeOut;
  const isClockedOut = !!todayLog?.timeOut;
  const isOnBreak = !!todayLog?.breakStart && !todayLog?.breakEnd;

  // 2. ANALYTICS (Weekly)
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0,0,0,0);

  const weeklyLogs = await prisma.attendance.findMany({
    where: {
      userId: user.id,
      date: { gte: startOfWeek }
    }
  });

  let totalHoursThisWeek = 0;
  weeklyLogs.forEach(log => {
    if (log.timeIn && log.timeOut) {
      let durationMs = log.timeOut.getTime() - log.timeIn.getTime();
      if (log.breakStart && log.breakEnd) {
        durationMs -= (log.breakEnd.getTime() - log.breakStart.getTime());
      }
      totalHoursThisWeek += durationMs / (1000 * 60 * 60);
    }
  });

  // 3. GET RECENT ACTIVITY (Last 3 logs excluding today)
  // This populates the new bottom card
  const recentLogs = await prisma.attendance.findMany({
    where: {
      userId: user.id,
      date: { lt: today }, // Only past days
      timeOut: { not: null } // Only completed shifts
    },
    orderBy: { date: 'desc' },
    take: 3
  });

  return (
    <EmployeeLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-[calc(100vh-140px)] items-stretch mt-4 max-w-5xl mx-auto">
        
        {/* LEFT COLUMN: MAIN ACTION CARD (Full Height) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm text-center relative overflow-hidden flex flex-col justify-between h-full">
          
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-80" />

          {/* TOP: Time */}
          <div className="flex-1 flex flex-col justify-center space-y-1">
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h1>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs md:text-sm">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* MIDDLE: Avatar & Status */}
          <div className="flex-1 flex flex-col justify-center items-center gap-5">
             <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-sm overflow-hidden transition-all duration-500 ${
                isOnBreak ? 'border-orange-400 bg-orange-50' : 
                isClockedIn ? 'border-green-500 bg-green-50' : 
                'border-secondary bg-secondary'
              }`}>
                 {isOnBreak ? (
                   <Coffee size={32} className="text-orange-500 animate-pulse" />
                 ) : user.photoUrl ? (
                   <img src={user.photoUrl} alt="Me" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-3xl font-bold text-muted-foreground">
                     {user.firstName[0]}{user.lastName[0]}
                   </span>
                 )}
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                {isOnBreak ? 'Enjoy your break!' : `Good day, ${user.firstName}!`}
              </h2>
              <p className="text-muted-foreground text-base">
                {isClockedOut ? 'Have a great rest of your day.' : isOnBreak ? 'Click below to resume work.' : 'Ready to start your shift?'}
              </p>
            </div>

            {/* BUTTONS */}
            <div className="max-w-sm w-full pt-2">
              {!isClockedIn && !isClockedOut && (
                <form action={ClockInButton} className="w-full">
                  <input type="hidden" name="userId" value={user.id} />
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-lg shadow-blue-500/20 shadow-lg transition-all transform hover:scale-[1.02]">
                    Clock In
                  </button>
                </form>
              )}

              {isClockedIn && (
                <div className="grid grid-cols-2 gap-3">
                  <form action={toggleBreak} className="w-full">
                    <input type="hidden" name="userId" value={user.id} />
                    <button className={`w-full font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                      isOnBreak 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 shadow-sm' 
                        : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border'
                    }`}>
                      {isOnBreak ? 'End Break' : <><Coffee size={18} /> Break</>}
                    </button>
                  </form>

                  {!isOnBreak && (
                    <form action={ClockOutButton} className="w-full">
                      <input type="hidden" name="userId" value={user.id} />
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-red-500/10 hover:shadow-red-500/20">
                        Clock Out
                      </button>
                    </form>
                  )}
                </div>
              )}

              {isClockedOut && (
                <div className="p-3 bg-green-500/10 text-green-700 rounded-xl font-bold border border-green-500/20 text-center text-base">
                  🎉 Shift Completed
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 hidden lg:block" /> 
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-5 h-full">
          
          {/* 1. WEEKLY PROGRESS */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-600">
                <TrendingUp size={18} />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wide text-muted-foreground">Weekly Hours</h3>
            </div>
            
            <div className="flex items-end gap-1 mb-3">
              <span className="text-4xl font-black tracking-tighter">{totalHoursThisWeek.toFixed(1)}</span>
              <span className="text-muted-foreground font-bold mb-1 text-sm">/ 40</span>
            </div>
            
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.4)]" 
                style={{ width: `${Math.min((totalHoursThisWeek / 40) * 100, 100)}%` }} 
              />
            </div>
          </div>

          {/* 2. TODAY'S SHIFT (Pulled Up / Compact) */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                <CalendarDays size={18} />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wide text-muted-foreground">Today's Shift</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <span className="text-muted-foreground text-sm font-bold">Start Time</span>
                <span className="font-black text-lg">08:00 AM</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <span className="text-muted-foreground text-sm font-bold">End Time</span>
                <span className="font-black text-lg">05:00 PM</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Location</span>
                 </div>
                 <span className="bg-secondary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-foreground">On Site</span>
              </div>
            </div>
          </div>

          {/* 3. NEW SECTION: RECENT ACTIVITY (Fills remaining space) */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex-1 flex flex-col">
             <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                    <History size={18} />
                  </div>
                  <h3 className="font-bold text-xs uppercase tracking-wide text-muted-foreground">Recent Activity</h3>
                </div>
                <ArrowRight size={16} className="text-muted-foreground opacity-50" />
             </div>

             <div className="flex-1 space-y-3">
                {recentLogs.length > 0 ? recentLogs.map((log) => {
                  const hours = log.timeOut && log.timeIn 
                    ? ((log.timeOut.getTime() - log.timeIn.getTime()) / (1000 * 60 * 60)).toFixed(1)
                    : '0';
                  
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border cursor-default group">
                       <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">
                            {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                            {new Date(log.timeIn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {log.timeOut ? new Date(log.timeOut).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '...'}
                          </span>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-foreground">{hours} <span className="text-[10px] text-muted-foreground font-bold">hrs</span></span>
                       </div>
                    </div>
                  );
                }) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground opacity-60">
                     <p className="text-sm italic">No recent shifts found</p>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </EmployeeLayout>
  );
}
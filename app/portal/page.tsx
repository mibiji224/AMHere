import { prisma } from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import EmployeeLayout from '@/app/components/EmployeeLayout';
import { ClockInButton, ClockOutButton, toggleBreak } from './actions';
import { Coffee, TrendingUp, CalendarDays, MapPin, History, ArrowRight } from 'lucide-react';
import LiveClock from './LiveClock';

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
  const recentLogs = await prisma.attendance.findMany({
    where: {
      userId: user.id,
      date: { lt: today },
      timeOut: { not: null }
    },
    orderBy: { date: 'desc' },
    take: 3
  });

  // *** STYLES ***
  const neonWrapperClasses = "relative p-[2px] rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] dark:shadow-[0_0_25px_-5px_rgba(139,92,246,0.4)] transition-all duration-500 hover:shadow-[0_0_50px_-5px_rgba(37,99,235,0.7)] group";
  const innerNeonCardClasses = "h-full w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl rounded-[1.4rem] overflow-hidden relative z-10 flex flex-col justify-center items-center";
  const glassCardClasses = "bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-lg shadow-black/5 hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300";

  return (
    <EmployeeLayout>
      {/* BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 dark:bg-blue-600/10 rounded-full blur-[100px] animate-pulse mix-blend-multiply dark:mix-blend-soft-light" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 dark:bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-1000 mix-blend-multiply dark:mix-blend-soft-light" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-[calc(100vh-140px)] items-stretch mt-2 max-w-5xl mx-auto px-2 md:px-0 pb-2">
        
        {/* === LEFT COLUMN: NEON GLOW CARD === */}
        <div className={`lg:col-span-2 ${neonWrapperClasses}`}>
          <div className={`${innerNeonCardClasses} p-4 md:p-6 text-center`}>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-30 pointer-events-none" />

            {/* TOP: Time Display */}
            <LiveClock />

            {/* MIDDLE: Avatar & Status */}
            <div className="flex flex-col items-center gap-6 relative z-10 pb-6 pt-2">
               
               {/* Avatar Container */}
               <div className="relative group/avatar">
                 <div className={`w-24 h-24 rounded-full flex items-center justify-center border-[4px] shadow-xl overflow-hidden transition-all duration-500 relative z-10 ${
                    isOnBreak ? 'border-orange-400 bg-orange-50/80 shadow-[0_0_15px_rgba(251,146,60,0.6)]' :
                    isClockedIn ? 'border-green-500 bg-green-50/80 shadow-[0_0_15px_rgba(34,197,94,0.6)]' :
                    isClockedOut ? 'border-green-400 bg-green-50/80 shadow-[0_0_15px_rgba(74,222,128,0.6)]' :
                    'border-white/60 bg-white/20 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  }`}>
                     {isOnBreak ? (
                       <Coffee size={36} className="text-orange-500 animate-pulse" />
                     ) : user.photoUrl ? (
                       <img src={user.photoUrl} alt="Me" className="w-full h-full object-cover transform group-hover/avatar:scale-110 transition-transform duration-700" />
                     ) : (
                       <span className="text-3xl font-black text-muted-foreground/70">
                         {user.firstName[0]}{user.lastName[0]}
                       </span>
                     )}
                </div>
                
                {/* --- PULSE ANIMATION --- 
                   UPDATED: Changed to '-inset-1' for a tighter radius. 
                   It will barely extend beyond the avatar border.
                */}
                {(isClockedIn || isOnBreak) && (
                  <span className={`absolute inset-2 rounded-full animate-pulse opacity-40 ${
                    isOnBreak ? 'bg-orange-500' : 'bg-blue-600'
                  }`} />
                )}
               </div>

               {/* Status Pill */}
               {(isClockedIn || isOnBreak || isClockedOut) && (
                 <div className={`px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-md border border-white/20 backdrop-blur-md ${
                   isOnBreak ? 'bg-orange-500/90 text-white' :
                   isClockedOut ? 'bg-green-500/90 text-white' :
                   'bg-blue-600/90 text-white'
                 }`}>
                   {isOnBreak ? '☕ On Break' : isClockedOut ? '✓ Completed' : '● Clocked In'}
                 </div>
               )}
            </div>

            {/* BOTTOM: Buttons & Greeting */}
            <div className="w-full max-w-xs pt-2 relative z-10">
                {!isClockedIn && !isClockedOut && (
                  <form action={ClockInButton} className="w-full">
                    <input type="hidden" name="userId" value={user.id} />
                    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl text-base shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)] transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                      Clock In
                    </button>
                  </form>
                )}

                {isClockedIn && (
                  <div className={`grid gap-3 ${isOnBreak ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <form action={toggleBreak} className="w-full">
                      <input type="hidden" name="userId" value={user.id} />
                      <button className={`w-full font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] ${
                        isOnBreak 
                          ? 'bg-orange-500 text-white border border-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.5)]' 
                          : 'bg-white/70 hover:bg-white text-foreground border border-white/40 backdrop-blur-md shadow-sm'
                      }`}>
                        {isOnBreak ? 'End Break' : <><Coffee size={18} /> Break</>}
                      </button>
                    </form>

                    {!isOnBreak && (
                      <form action={ClockOutButton} className="w-full">
                        <input type="hidden" name="userId" value={user.id} />
                        <button className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.7)] transform hover:scale-[1.02] active:scale-[0.98]">
                          Clock Out
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {isClockedOut && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 rounded-xl font-bold text-center shadow-[0_0_15px_rgba(34,197,94,0.2)] backdrop-blur-md text-sm">
                    <span className="text-xl mr-2">🎉</span> You are all done for today!
                  </div>
                )}

                <div className="space-y-1 pt-6">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
                    {isOnBreak ? 'Enjoy your break!' : isClockedOut ? 'Great work today!' : `Good day, ${user.firstName}!`}
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium">
                    {isClockedOut ? 'Shift completed. Have a wonderful rest of your day.' : isOnBreak ? 'Ready to get back to work?' : 'Your team is waiting. Ready to start?'}
                  </p>
                </div>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: STANDARD GLASS CARDS === */}
        <div className="flex flex-col gap-5 h-full">
          
          {/* 1. WEEKLY PROGRESS */}
          <div className={glassCardClasses}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-700 dark:text-green-400">
                <TrendingUp size={18} />
              </div>
              <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Weekly Goal</h3>
            </div>
            
            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-black tracking-tight text-foreground">{totalHoursThisWeek.toFixed(1)}</span>
              <span className="text-muted-foreground font-bold mb-1 text-xs">/ 40 hrs</span>
            </div>
            
            <div className="w-full bg-black/5 dark:bg-white/5 h-3 rounded-full overflow-hidden p-[2px]">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-1000 relative" 
                style={{ width: `${Math.min((totalHoursThisWeek / 40) * 100, 100)}%` }} 
              />
            </div>
          </div>

          {/* 2. TODAY'S SHIFT */}
          <div className={glassCardClasses}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-700 dark:text-blue-400">
                <CalendarDays size={18} />
              </div>
              <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Today's Schedule</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5">
                <span className="text-xs font-bold text-muted-foreground">Start Time</span>
                <span className="font-black text-lg text-foreground">08:00 AM</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5">
                <span className="text-xs font-bold text-muted-foreground">End Time</span>
                <span className="font-black text-lg text-foreground">05:00 PM</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Location</span>
                 </div>
                 <span className="bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-400/20">
                   On Site
                 </span>
              </div>
            </div>
          </div>

          {/* 3. RECENT ACTIVITY */}
          <div className={`${glassCardClasses} flex-1 flex flex-col`}>
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-700 dark:text-purple-400">
                    <History size={18} />
                  </div>
                  <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Recent Activity</h3>
                </div>
                <ArrowRight size={16} className="text-muted-foreground/50 hover:text-purple-500 transition-colors cursor-pointer" />
             </div>

             <div className="flex-1 space-y-2">
                {recentLogs.length > 0 ? recentLogs.map((log) => {
                  const hours = log.timeOut && log.timeIn 
                    ? ((log.timeOut.getTime() - log.timeIn.getTime()) / (1000 * 60 * 60)).toFixed(1)
                    : '0';
                  
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-all border border-transparent hover:border-white/20 group cursor-default">
                       <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mt-0.5">
                            {new Date(log.timeIn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {log.timeOut ? new Date(log.timeOut).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '...'}
                          </span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-foreground">{hours}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">hrs</span>
                       </div>
                    </div>
                  );
                }) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground/50">
                     <p className="text-xs font-medium italic">No recent shifts</p>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </EmployeeLayout>
  );
}
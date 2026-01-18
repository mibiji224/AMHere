import { prisma } from '../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logout } from '../login/action';
import { toggleAttendance, toggleBreak } from '../actions';
import LeaveSection from './LeaveSection'; 
import ScheduleRequestSection from './ScheduleRequestSection'; 
import ThemeToggle from '../components/ThemeToggle'; 
import { ThemeProvider } from '../components/ThemeProvider'; 

export const dynamic = 'force-dynamic';

export default async function EmployeePortal() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;

  if (!userId) redirect('/login');

  // 1. Fetch User Data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      attendance: {
        where: { 
          date: { gte: new Date(new Date().setHours(0,0,0,0)) } 
        },
        orderBy: { timeIn: 'desc' },
        take: 1
      },
      leaveRequests: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      scheduleRequests: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!user) return <div>User not found</div>;

  // 2. Calculate Status
  const todayLog = user.attendance[0];
  const isClockedIn = !!todayLog && !todayLog.timeOut;
  const isOnBreak = !!todayLog && !!todayLog.breakStart && !todayLog.breakEnd;

  let breakDurationMinutes = 0;
  if (isOnBreak && todayLog.breakStart) {
    const start = new Date(todayLog.breakStart).getTime();
    const now = new Date().getTime();
    breakDurationMinutes = Math.floor((now - start) / 60000);
  }

  return (
    // 👇 WRAPPER: Ensures this page uses 'portal-theme' instead of 'admin-theme'
    <ThemeProvider storageKey="portal-theme">
      <main className="min-h-screen bg-background flex flex-col transition-colors duration-300">
        
        {/* HEADER */}
        <header className="bg-card p-4 shadow-sm flex justify-between items-center sticky top-0 z-10 border-b border-border">
          <div>
             <h1 className="font-bold text-foreground">My Portal</h1>
             <p className="text-xs text-muted-foreground">Welcome, {user.firstName}</p>
          </div>
          
          <div className="flex items-center gap-4">
              <ThemeToggle />
              
              <form action={logout}>
                <button className="text-sm text-destructive hover:bg-destructive/10 px-3 py-1 rounded font-medium transition">
                  Logout
                </button>
              </form>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col items-center p-6 space-y-8 max-w-md mx-auto w-full">
          
          {/* STATUS CARD */}
          <div className="text-center mt-4">
             <div className={`inline-block p-6 rounded-full mb-4 shadow-sm transition-colors ${
               isOnBreak ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
               isClockedIn ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-secondary text-muted-foreground'
             }`}>
               <span className="text-5xl">
                 {isOnBreak ? '☕️' : isClockedIn ? '⚡️' : 'zzz'}
               </span>
             </div>
             
             <h2 className="text-2xl font-bold text-foreground">
               {isOnBreak ? 'On Break' : isClockedIn ? 'You are Clocked In' : 'You are Clocked Out'}
             </h2>
             
             {isOnBreak && (
               <p className={`mt-2 font-mono font-bold ${breakDurationMinutes > 60 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
                 {breakDurationMinutes} mins elapsed
               </p>
             )}
          </div>

          {/* CLOCK IN / BREAK BUTTONS */}
          <div className="w-full space-y-3">
            
            {!isOnBreak && (
               <form action={async () => {
                 'use server';
                 await toggleAttendance(userId);
               }}>
                 <button className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition transform active:scale-95 ${
                   isClockedIn 
                     ? 'bg-red-500 hover:bg-red-600 text-white dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-100' 
                     : 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-800 dark:hover:bg-green-700 dark:text-green-100'
                 }`}>
                   {isClockedIn ? 'Clock Out' : 'Clock In'}
                 </button>
               </form>
            )}

            {isClockedIn && (
              <form action={async () => {
                  'use server';
                  await toggleBreak(todayLog.id);
              }}>
                <button className={`w-full py-3 rounded-xl font-bold border-2 transition ${
                  isOnBreak
                    ? 'bg-yellow-400 border-yellow-500 text-yellow-900 shadow-md dark:bg-yellow-600 dark:border-yellow-700 dark:text-yellow-100'
                    : 'bg-card border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:bg-secondary dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20'
                }`}>
                  {isOnBreak ? 'End Break' : 'Take a Break'}
                </button>
              </form>
            )}

          </div>

          {/* REQUEST SECTIONS (With The Fix) */}
          <LeaveSection 
            requests={user.leaveRequests} 
            userEmail={user.email} // 👈 Added this prop
          />
          
          <ScheduleRequestSection 
            requests={user.scheduleRequests} 
            userEmail={user.email} // 👈 Added this prop
          />

        </div>
      </main>
    </ThemeProvider>
  );
}
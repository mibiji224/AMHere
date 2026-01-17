import { prisma } from '../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logout } from '../login/action';
import { toggleAttendance, toggleBreak } from '../actions'; // We will add break action next

export const dynamic = 'force-dynamic';

export default async function EmployeePortal() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      attendance: {
        where: { 
          date: { gte: new Date(new Date().setHours(0,0,0,0)) } 
        },
        orderBy: { timeIn: 'desc' },
        take: 1
      }
    }
  });

  if (!user) return <div>User not found</div>;

  const todayLog = user.attendance[0];
  const isClockedIn = !!todayLog && !todayLog.timeOut;
  const isOnBreak = !!todayLog && !!todayLog.breakStart && !todayLog.breakEnd;

  // Calculate Break Duration if on break
  let breakDurationMinutes = 0;
  if (isOnBreak && todayLog.breakStart) {
    const start = new Date(todayLog.breakStart).getTime();
    const now = new Date().getTime();
    breakDurationMinutes = Math.floor((now - start) / 60000);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm flex justify-between items-center">
        <div>
           <h1 className="font-bold text-gray-800">My Portal</h1>
           <p className="text-xs text-gray-500">Welcome, {user.firstName}</p>
        </div>
        <form action={logout}>
           <button className="text-sm text-red-500 hover:bg-red-50 px-3 py-1 rounded">Logout</button>
        </form>
      </header>

      {/* Main Action Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        
        {/* Status Card */}
        <div className="text-center">
           <div className={`inline-block p-4 rounded-full mb-4 ${
             isOnBreak ? 'bg-yellow-100 text-yellow-600' :
             isClockedIn ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
           }`}>
             <span className="text-4xl">
               {isOnBreak ? '☕️' : isClockedIn ? '⚡️' : 'zzz'}
             </span>
           </div>
           <h2 className="text-2xl font-bold text-gray-900">
             {isOnBreak ? 'On Break' : isClockedIn ? 'You are Clocked In' : 'You are Clocked Out'}
           </h2>
           {isOnBreak && (
             <p className={`mt-2 font-mono font-bold ${breakDurationMinutes > 60 ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
               Time Elapsed: {breakDurationMinutes} mins
               {breakDurationMinutes > 60 && <span className="block text-sm">⚠️ Over 1 Hour Limit!</span>}
             </p>
           )}
        </div>

        {/* Buttons */}
        <div className="w-full max-w-xs space-y-4">
          
          {/* Main Clock In / Out Toggle */}
          {!isOnBreak && (
             <form action={async () => {
               'use server';
               await toggleAttendance(userId);
             }}>
               <button className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition transform active:scale-95 ${
                 isClockedIn 
                   ? 'bg-red-500 hover:bg-red-600 text-white' 
                   : 'bg-green-600 hover:bg-green-700 text-white'
               }`}>
                 {isClockedIn ? 'Clock Out' : 'Clock In'}
               </button>
             </form>
          )}

          {/* Break Toggle (Only visible if clocked in) */}
          {isClockedIn && (
            <form action={async () => {
                'use server';
                await toggleBreak(todayLog.id);
            }}>
              <button className={`w-full py-3 rounded-xl font-bold border-2 transition ${
                isOnBreak
                  ? 'bg-yellow-400 border-yellow-500 text-yellow-900'
                  : 'bg-white border-yellow-400 text-yellow-600 hover:bg-yellow-50'
              }`}>
                {isOnBreak ? 'End Break (Back to Work)' : 'Take a Break ☕️'}
              </button>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}
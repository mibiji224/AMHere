import { prisma } from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import EmployeeLayout from '@/app/components/EmployeeLayout';
import { ClockInButton, ClockOutButton, toggleBreak } from './actions';
import { Coffee } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EmployeePortal() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;
  if (!userId) return <div>Unauthorized</div>;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return <div>User not found</div>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayLog = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      date: { gte: today, lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    }
  });

  const isClockedIn = !!todayLog?.timeIn && !todayLog?.timeOut;
  const isClockedOut = !!todayLog?.timeOut;
  const isOnBreak = !!todayLog?.breakStart && !todayLog?.breakEnd;

  return (
    <EmployeeLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-foreground">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h1>
          <p className="text-muted-foreground font-medium text-lg">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-lg text-center space-y-8">
          <div className="flex justify-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-inner overflow-hidden ${isOnBreak ? 'border-orange-500 bg-orange-100' : 'border-background bg-secondary'}`}>
               {isOnBreak ? <Coffee size={40} className="text-orange-600 animate-pulse" /> : user.photoUrl ? <img src={user.photoUrl} alt="Me" className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-muted-foreground">{user.firstName[0]}{user.lastName[0]}</span>}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{isOnBreak ? 'Enjoy your break!' : `Good day, ${user.firstName}!`}</h2>
            <p className="text-muted-foreground mt-1">{isOnBreak ? 'Click below when you return.' : 'Ready to work?'}</p>
          </div>
          <div className="space-y-3">
            {!isClockedIn && !isClockedOut && (
              <form action={ClockInButton} className="w-full"><input type="hidden" name="userId" value={user.id} /><button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg shadow-blue-500/20 shadow-lg transition-all transform hover:scale-[1.02]">Clock In</button></form>
            )}
            {isClockedIn && (
              <>
                <form action={toggleBreak} className="w-full"><input type="hidden" name="userId" value={user.id} /><button className={`w-full font-bold py-3 rounded-xl text-md shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${isOnBreak ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border'}`}>{isOnBreak ? 'End Break' : <><Coffee size={18} /> Take a Break</>}</button></form>
                {!isOnBreak && <form action={ClockOutButton} className="w-full"><input type="hidden" name="userId" value={user.id} /><button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-lg shadow-red-500/20 shadow-lg transition-all transform hover:scale-[1.02]">Clock Out</button></form>}
              </>
            )}
            {isClockedOut && <div className="p-4 bg-green-500/10 text-green-600 rounded-xl font-bold border border-green-500/20">You are done for the day! 🎉</div>}
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
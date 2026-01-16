import { prisma } from '../lib/prisma';
import { toggleAttendance } from '../actions';

// Force the page to always show live data
export const dynamic = 'force-dynamic';

export default async function AttendanceKiosk() {
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    orderBy: { firstName: 'asc' },
    include: {
      attendance: {
        where: { timeOut: null },
      },
    },
  });

  return (
    // changed bg-slate-900 to bg-gray-50 (Light Mode)
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Team Attendance</h1>
          <p className="text-gray-500">Select your name to clock in or out.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => {
            const isWorking = emp.attendance.length > 0;

            return (
              <form key={emp.id} action={async () => {
                'use server';
                await toggleAttendance(emp.id);
              }}>
                <button
                  type="submit"
                  className={`w-full p-6 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 text-left group shadow-sm ${
                    isWorking 
                      ? 'bg-green-50 border-green-500 hover:bg-green-100' // Active: Light Green
                      : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-md' // Inactive: White
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`font-bold text-lg ${isWorking ? 'text-green-700' : 'text-gray-900'}`}>
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <p className={`text-sm ${isWorking ? 'text-green-600' : 'text-gray-500'}`}>{emp.position}</p>
                    </div>
                    {/* Status Dot */}
                    <div className={`w-3 h-3 rounded-full ${isWorking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                  </div>
                  
                  <div className={`text-sm font-medium uppercase tracking-wider ${isWorking ? 'text-green-700' : 'text-gray-400 group-hover:text-blue-500'}`}>
                    {isWorking ? 'Currently Working' : 'Clocked Out'}
                  </div>
                </button>
              </form>
            );
          })}
        </div>
      </div>
    </main>
  );
}
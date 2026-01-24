import { prisma } from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import EmployeeLayout from '@/app/components/EmployeeLayout';
import ScheduleRequestSection from '@/app/portal/ScheduleRequestSection'; // Reuse your component
import { Clock, Calendar } from 'lucide-react';

export default async function RequestsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  // FETCH BOTH REQUEST TYPES
  const scheduleRequests = await prisma.scheduleChangeRequest.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <EmployeeLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
           <h1 className="text-3xl font-black">My Requests</h1>
           <p className="text-muted-foreground">Track your schedule changes and leave applications.</p>
        </div>

        {/* REUSE EXISTING COMPONENT FOR FORM SUBMISSION */}
        {/* We pass the list, but we can customize the list display inside the component or below it */}
        <ScheduleRequestSection requests={scheduleRequests} userEmail={user.email} />
        
        {/* DETAILED HISTORY LIST (Better Visibility) */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Request History</h3>
          {scheduleRequests.map(req => (
            <div key={req.id} className="bg-card border border-border p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${req.requestedStart ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                   {req.requestedStart ? <Clock size={20}/> : <Calendar size={20}/>}
                </div>
                <div>
                   <h4 className="font-bold text-sm">
                     {req.requestedStart ? 'Shift Time Change' : 'Work Days Change'}
                   </h4>
                   <p className="text-xs text-muted-foreground">"{req.reason}"</p>
                   {req.requestedStart && (
                     <p className="text-xs font-bold text-blue-600 mt-1">
                       New Time: {req.requestedStart} - {req.requestedEnd}
                     </p>
                   )}
                </div>
              </div>
              
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {req.status}
                </span>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </EmployeeLayout>
  );
}
import { prisma } from '@/app/lib/prisma';
import AdminLayout from '@/app/components/AdminLayout';
import { approveScheduleChange, rejectScheduleChange } from './actions';
import { Clock, Calendar, ArrowRight, AlertCircle } from 'lucide-react';

export default async function SchedulesPage() {
  const requests = await prisma.scheduleChangeRequest.findMany({
    where: { status: 'PENDING' },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  // Standardize the week order to match the Request Form (Monday -> Sunday)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <AdminLayout>
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Work Schedules</h1>
          <p className="text-muted-foreground">Manage shift times and weekly rosters.</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-8 w-1 bg-blue-600 rounded-full"/>
             <h2 className="text-xl font-bold">Pending Requests <span className="text-muted-foreground font-normal text-sm ml-2">({requests.length})</span></h2>
          </div>

          {requests.length > 0 ? requests.map((req) => (
            <div key={req.id} className="bg-card border border-border p-0 rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-all">
              
              {/* HEADER */}
              <div className="p-6 border-b border-border bg-secondary/20 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-lg">
                    {req.user.firstName[0]}{req.user.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{req.user.firstName} {req.user.lastName}</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{req.user.position}</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-white border border-border px-3 py-1 rounded-full text-muted-foreground">
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* REASON */}
                <div className="md:col-span-1 space-y-2">
                   <p className="text-xs font-bold text-muted-foreground uppercase">Reason for Request</p>
                   <div className="bg-secondary/50 p-4 rounded-xl text-sm italic text-foreground border border-border/50 relative">
                     <span className="absolute top-2 left-2 text-4xl text-muted-foreground/20 font-serif">“</span>
                     <p className="relative z-10">{req.reason}</p>
                   </div>
                </div>

                {/* THE CHANGE (VISUAL) */}
                <div className="md:col-span-2 space-y-2">
                   <p className="text-xs font-bold text-muted-foreground uppercase">Proposed Change</p>
                   
                   {req.requestedStart ? (
                     // OPTION A: TIME CHANGE VISUAL
                     <div className="flex items-center gap-4 bg-blue-50/50 border border-blue-100 p-5 rounded-xl">
                        <div className="text-center">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Current</p>
                           <p className="font-mono font-bold text-lg text-muted-foreground line-through decoration-red-400 opacity-70">
                             {req.user.shiftStart} - {req.user.shiftEnd}
                           </p>
                        </div>
                        <ArrowRight className="text-blue-400" />
                        <div className="text-center">
                           <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">New Shift</p>
                           <p className="font-mono font-black text-2xl text-blue-700">
                             {req.requestedStart} - {req.requestedEnd}
                           </p>
                        </div>
                     </div>
                   ) : (
                     // OPTION B: DAYS CHANGE VISUAL (Fixed Grid)
                     <div className="bg-secondary/10 border border-border rounded-xl p-4">
                        <div className="grid grid-cols-7 gap-2">
                          {weekDays.map((day, i) => {
                             // Correctly access key 'day-0' for Mon, 'day-1' for Tue...
                             const status = (req.proposedSchedule as any)?.[`day-${i}`];
                             const isChange = status && status !== '' && status !== 'No Change';
                             
                             return (
                               <div key={day} className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                                 isChange 
                                  ? status === 'OFF' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700' 
                                  : 'bg-background border-border/50 text-muted-foreground opacity-60'
                               }`}>
                                  <span className="text-[10px] font-black uppercase mb-1 opacity-70">{day}</span>
                                  <span className="text-xs font-bold whitespace-nowrap">
                                    {status === 'OFF' ? 'OFF' : status === 'ONSITE' ? 'On Site' : status === 'REMOTE' ? 'Remote' : '-'}
                                  </span>
                               </div>
                             )
                          })}
                        </div>
                        {(!req.proposedSchedule || Object.keys(req.proposedSchedule as object).length === 0) && (
                           <div className="text-center pt-4 pb-2 text-xs text-muted-foreground italic flex items-center justify-center gap-2">
                             <AlertCircle size={14} /> No specific day changes selected (Reason only).
                           </div>
                        )}
                     </div>
                   )}
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="p-4 bg-secondary/30 border-t border-border flex gap-3 justify-end">
                <form action={rejectScheduleChange}>
                  <input type="hidden" name="requestId" value={req.id} />
                  <button className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-white hover:text-red-600 transition-colors text-sm border border-transparent hover:border-red-100">
                    Reject
                  </button>
                </form>
                <form action={approveScheduleChange}>
                  <input type="hidden" name="requestId" value={req.id} />
                  <button className="px-6 py-2.5 rounded-xl font-bold bg-foreground text-background hover:bg-blue-600 transition-all text-sm shadow-lg hover:shadow-blue-500/20">
                    Approve Request
                  </button>
                </form>
              </div>

            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed border-border rounded-3xl text-muted-foreground">
               <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                 <Calendar className="opacity-20" size={32} />
               </div>
               <p className="font-medium">No pending requests at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
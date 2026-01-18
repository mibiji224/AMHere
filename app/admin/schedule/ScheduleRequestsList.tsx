'use client'

import { approveRequest, rejectRequest } from './actions';

type ScheduleRequest = {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    position: string;
  };
  reason: string;
  createdAt: Date;
  proposedSchedule: any; // This holds the JSON of the new shifts
};

export default function ScheduleRequestsList({ requests }: { requests: ScheduleRequest[] }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-bold text-lg text-foreground">Schedule Change Requests</h3>
        {requests.length > 0 && (
          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
            {requests.length} Pending
          </span>
        )}
      </div>

      {/* REQUEST CARDS */}
      {requests.length > 0 ? (
        requests.map((req) => {
          // 1. Parse the Proposed Schedule (it comes as JSON)
          // We default to an empty array if something is wrong
          const newSchedule = Array.isArray(req.proposedSchedule) 
            ? req.proposedSchedule 
            : [];

          return (
            <div key={req.id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              
              {/* TOP ROW: User Info & Date */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-foreground text-base">
                    {req.user.firstName} {req.user.lastName}
                  </h4>
                  <p className="text-xs text-muted-foreground">{req.user.position}</p>
                </div>
                <div className="text-[10px] font-bold bg-secondary text-muted-foreground px-2 py-1 rounded">
                  {new Date(req.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* REASON BOX */}
              <div className="bg-secondary/30 p-3 rounded-lg text-sm text-foreground italic border border-border/50">
                "{req.reason}"
              </div>

              {/* 👇 NEW FEATURE: PROPOSED SCHEDULE PREVIEW */}
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Requested Schedule:</p>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, idx) => {
                    // Find the shift for this specific day (0=Sun, 1=Mon...)
                    const shift = newSchedule.find((s: any) => s.dayOfWeek === idx);
                    const type = shift?.workType || 'REST'; // Default to REST if missing

                    return (
                      <div key={day} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{day}</span>
                        <div className={`
                          w-full h-8 rounded flex items-center justify-center text-[9px] font-bold border transition-colors
                          ${type === 'ONSITE' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : ''}
                          ${type === 'REMOTE' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' : ''}
                          ${type === 'REST' ? 'bg-secondary text-muted-foreground border-transparent opacity-50' : ''}
                        `}>
                          {type === 'REST' ? '-' : type.slice(0, 3)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 pt-2">
                <form action={async () => await approveRequest(req.id)} className="flex-1">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition">
                    ✓ Approve Change
                  </button>
                </form>
                
                <form action={async () => await rejectRequest(req.id)} className="flex-1">
                  <button className="w-full bg-secondary hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent text-muted-foreground text-xs font-bold py-2.5 rounded-lg transition">
                    ✕ Reject
                  </button>
                </form>
              </div>

            </div>
          );
        })
      ) : (
        <div className="p-8 text-center border border-dashed border-border rounded-xl">
          <p className="text-sm text-muted-foreground">No pending schedule requests.</p>
        </div>
      )}
    </div>
  );
}
'use client'

import { approveRequest, rejectRequest } from './actions';

type Request = {
  id: string;
  user: { firstName: string; lastName: string; position: string };
  reason: string;
  createdAt: Date;
};

export default function ScheduleRequestsList({ requests }: { requests: Request[] }) {
  if (requests.length === 0) return null; // Don't show anything if no requests

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
        🔔 Schedule Change Requests
        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
          {requests.length}
        </span>
      </h2>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((req) => (
          <div key={req.id} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between gap-3">
            
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-foreground text-sm">{req.user.firstName} {req.user.lastName}</h3>
                  <p className="text-xs text-muted-foreground">{req.user.position}</p>
                </div>
                <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded">
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="mt-3 bg-secondary/50 p-2 rounded-lg text-sm text-foreground italic border border-border/50">
                "{req.reason}"
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <form action={approveRequest.bind(null, req.id)} className="flex-1">
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-1.5 rounded-lg text-xs font-bold transition">
                  ✔ Acknowledge
                </button>
              </form>
              <form action={rejectRequest.bind(null, req.id)} className="flex-1">
                <button className="w-full bg-secondary hover:bg-destructive/10 text-muted-foreground hover:text-destructive py-1.5 rounded-lg text-xs font-bold transition border border-border">
                  ✕ Reject
                </button>
              </form>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
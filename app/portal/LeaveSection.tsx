'use client'

import { useState } from 'react';
import { submitLeaveRequest } from './actions';

type LeaveRequest = {
  id: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: string; // PENDING, APPROVED, REJECTED
};

export default function LeaveSection({ requests }: { requests: LeaveRequest[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-md mt-8">
      
      {/* Header & Button */}
      <div className="flex justify-between items-end mb-4 px-2">
        <h3 className="font-bold text-muted-foreground">My Leaves</h3>
        <button 
          onClick={() => setIsOpen(true)}
          className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-primary/90 transition"
        >
          + Request
        </button>
      </div>

      {/* List of Past Requests */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden space-y-1">
        {requests.length > 0 ? (
          requests.map(req => (
            <div key={req.id} className="p-4 flex justify-between items-center border-b border-border last:border-0">
              <div>
                <div className="text-sm font-bold text-foreground">
                   {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground italic mt-0.5">{req.reason}</div>
              </div>
              <div>
                 {req.status === 'PENDING' && (
                   <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">Pending</span>
                 )}
                 {req.status === 'APPROVED' && (
                   <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500 text-[10px] font-bold px-2 py-1 rounded-full border border-green-200 dark:border-green-800">Approved</span>
                 )}
                 {req.status === 'REJECTED' && (
                   <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500 text-[10px] font-bold px-2 py-1 rounded-full border border-red-200 dark:border-red-800">Rejected</span>
                 )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No leave history yet.
          </div>
        )}
      </div>

      {/* POPUP MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-border">
            
            <div className="bg-primary p-4 flex justify-between items-center text-primary-foreground">
               <h3 className="font-bold">Request Time Off</h3>
               <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100">✕</button>
            </div>

            <form action={async (formData) => {
                await submitLeaveRequest(formData);
                setIsOpen(false);
            }} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Start Date</label>
                {/* 👇 FIX: Uses bg-background and text-foreground */}
                <input 
                  type="date" 
                  name="startDate" 
                  required 
                  className="w-full bg-background border border-input rounded-lg p-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">End Date</label>
                <input 
                  type="date" 
                  name="endDate" 
                  required 
                  className="w-full bg-background border border-input rounded-lg p-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Reason</label>
                <textarea 
                  name="reason" 
                  rows={2} 
                  required 
                  placeholder="e.g. Sick Leave, Vacation..." 
                  className="w-full bg-background border border-input rounded-lg p-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50" 
                />
              </div>

              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl shadow-lg transition mt-2">
                Submit Request
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
'use client';

import { useState } from 'react';
import { submitScheduleChange } from './actions';
import { Plus, X, Clock, Calendar, ChevronDown } from 'lucide-react';

export default function ScheduleRequestSection({ requests, userEmail }: { requests: any[], userEmail: string }) {
  const [isOpen, setIsOpen] = useState(false);
  // New state to toggle between request types
  const [requestType, setRequestType] = useState<'days' | 'time'>('days');

  return (
    <div className="space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Schedule Requests</h2>
          <p className="text-muted-foreground">Manage your shift preferences.</p>
        </div>
        <button 
          onClick={() => {
            setRequestType('days'); // Default to 'days' on open
            setIsOpen(true);
          }}
          className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
        >
          <Plus size={18} /> New Request
        </button>
      </div>

      {/* REQUEST LIST (Existing) */}
      <div className="grid gap-4">
        {requests.length > 0 ? requests.map((req) => (
          <div key={req.id} className="group bg-card hover:bg-secondary/10 border border-border p-5 rounded-2xl transition-all hover:shadow-md flex flex-col md:flex-row gap-6 relative overflow-hidden">
             
             {/* Status Stripe */}
             <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                req.status === 'APPROVED' ? 'bg-green-500' : 
                req.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
             }`} />

             <div className="flex items-start gap-5 flex-1">
               {/* Icon Background - Adapted for Dark Mode */}
               <div className={`p-4 rounded-2xl shrink-0 ${
                 req.requestedStart 
                   ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                   : 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
               }`}>
                  {req.requestedStart ? <Clock size={24}/> : <Calendar size={24}/>}
               </div>
               
               <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-base text-foreground">
                      {req.requestedStart ? 'Shift Time Update' : 'Work Days Adjustment'}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                       req.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                       req.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                       'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground italic mb-3">"{req.reason}"</p>
                  
                  {req.requestedStart && (
                    <div className="inline-flex items-center gap-2 bg-secondary px-3 py-1 rounded-lg">
                      <span className="text-xs font-bold text-muted-foreground">Proposed:</span>
                      <span className="text-xs font-black text-foreground">{req.requestedStart} - {req.requestedEnd}</span>
                    </div>
                  )}
               </div>
             </div>

             <div className="flex flex-row md:flex-col justify-between md:items-end text-right pl-4 border-l border-border/50 md:border-l-0 md:pl-0">
               <span className="text-xs font-bold text-muted-foreground">Requested On</span>
               <span className="text-sm font-bold text-foreground">
                 {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
               </span>
             </div>
          </div>
        )) : (
          <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-3xl bg-secondary/5">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Plus className="text-muted-foreground opacity-50" size={32} />
            </div>
            <h3 className="font-bold text-foreground">No requests yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1">
              Need to change your schedule? Click the "New Request" button above.
            </p>
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          
          <div className="bg-card w-full max-w-3xl rounded-3xl border border-border shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/30">
              <div>
                <h3 className="font-black text-lg text-foreground">New Request</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Submit to Admin</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors border border-transparent hover:border-border text-foreground"><X size={18}/></button>
            </div>
            
            <form action={async (formData) => {
              await submitScheduleChange(formData);
              setIsOpen(false);
            }} className="p-6 space-y-6 overflow-y-auto">
              <input type="hidden" name="userEmail" value={userEmail} />

              {/* --- TABS TO SELECT REQUEST TYPE --- */}
              <div className="flex p-1 bg-secondary/50 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setRequestType('days')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    requestType === 'days' 
                      ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Calendar size={16} /> Change Work Days
                </button>
                <button 
                  type="button"
                  onClick={() => setRequestType('time')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    requestType === 'time' 
                      ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Clock size={16} /> Change Shift Times
                </button>
              </div>
              
              {/* CONDITIONAL INPUTS BASED ON TAB */}
              {requestType === 'days' ? (
                /* --- OPTION 1: CHANGE WORK DAYS (Clean Text) --- */
                <div className="space-y-3 animate-in fade-in duration-300">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    Proposed Daily Schedule
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                     {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => (
                       <div key={day} className="flex flex-col gap-1">
                         <span className="text-[10px] font-bold text-center text-muted-foreground uppercase">{day}</span>
                         <div className="relative">
                           <select 
                            name={`day-${i}`} 
                            className="w-full appearance-none p-2 pl-2 pr-6 bg-card border border-border rounded-lg text-xs font-bold text-foreground focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer hover:border-blue-400 transition-colors text-center"
                           >
                              <option value="">-</option>
                              <option value="ONSITE">Onsite</option>
                              <option value="REMOTE">Remote</option>
                              <option value="OFF">Day Off</option>
                           </select>
                           <ChevronDown className="absolute right-1 top-2.5 text-muted-foreground pointer-events-none opacity-50" size={12} />
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              ) : (
                /* --- OPTION 2: CHANGE SHIFT TIMES (iOS Style Time Picker) --- */
                <div className="space-y-3 animate-in fade-in duration-300">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    Proposed New Shift Times
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">New Start Time</span>
                      <input 
                        type="time" 
                        name="startTime" 
                        required={requestType === 'time'}
                        className="w-full p-4 rounded-xl bg-gray-100 dark:bg-secondary/20 border-none text-center font-bold text-lg text-blue-600 dark:text-blue-400 focus:ring-0 transition-all cursor-pointer appearance-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">New End Time</span>
                      <input 
                        type="time" 
                        name="endTime" 
                        required={requestType === 'time'}
                        className="w-full p-4 rounded-xl bg-gray-100 dark:bg-secondary/20 border-none text-center font-bold text-lg text-blue-600 dark:text-blue-400 focus:ring-0 transition-all cursor-pointer appearance-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* REASON INPUT (Always visible) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  Reason for Request <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="reason" 
                  required 
                  placeholder={requestType === 'days' ? "e.g. I have classes on Monday mornings..." : "e.g. Need to shift hours for childcare..."}
                  className="w-full p-3 bg-secondary/30 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[80px] resize-none" 
                />
              </div>

              {/* FORM BUTTONS */}
              <div className="pt-2 flex gap-3 border-t border-border mt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-2.5 text-sm font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-colors">Cancel</button>
                <button className="flex-1 bg-foreground text-background text-sm font-bold py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-md">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
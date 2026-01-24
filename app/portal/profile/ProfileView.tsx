'use client';

import { useState } from 'react';
import { User, Mail, Phone, Clock, Calendar, CheckCircle, Circle, Edit2, Save, X, Briefcase, ChevronDown } from 'lucide-react';
import { updateProfile, requestScheduleChange, toggleTask } from './actions';

export default function ProfileView({ user, tasks }: { user: any, tasks: any[] }) {
  const [activeTab, setActiveTab] = useState('schedule'); 
  const [isEditing, setIsEditing] = useState(false);
  const [isRequestingTime, setIsRequestingTime] = useState(false);
  const [requestType, setRequestType] = useState<'days' | 'time'>('days'); 

  // Helper to format 24h time to 12h AM/PM
  const formatTime = (time: string) => {
    if (!time) return '--:--';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="lg:col-span-1 space-y-2">
        <button 
          onClick={() => setActiveTab('details')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'details' ? 'bg-blue-600 text-white shadow-md' : 'bg-card hover:bg-secondary text-muted-foreground'}`}
        >
          <User size={18} /> Personal Details
        </button>
        <button 
          onClick={() => setActiveTab('schedule')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'schedule' ? 'bg-blue-600 text-white shadow-md' : 'bg-card hover:bg-secondary text-muted-foreground'}`}
        >
          <Clock size={18} /> Schedule & Shift
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'tasks' ? 'bg-blue-600 text-white shadow-md' : 'bg-card hover:bg-secondary text-muted-foreground'}`}
        >
          <CheckCircle size={18} /> My Tasks
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-8 shadow-sm min-h-[500px]">
        
        {/* --- TAB 1: PERSONAL DETAILS --- */}
        {activeTab === 'details' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="flex justify-between items-center pb-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-black">Personal Details</h2>
                <p className="text-muted-foreground">Manage your contact information.</p>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isEditing ? 'bg-secondary text-foreground' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isEditing ? <><X size={16} /> Cancel Edit</> : <><Edit2 size={16} /> Edit Details</>}
              </button>
            </div>
            <form action={async (formData) => { await updateProfile(formData); setIsEditing(false); }} className="space-y-6">
              <input type="hidden" name="userId" value={user.id} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-sm font-bold text-muted-foreground">First Name</label><input disabled value={user.firstName} className="w-full p-3 bg-secondary/50 rounded-xl font-bold opacity-70 cursor-not-allowed" /></div>
                <div className="space-y-2"><label className="text-sm font-bold text-muted-foreground">Last Name</label><input disabled value={user.lastName} className="w-full p-3 bg-secondary/50 rounded-xl font-bold opacity-70 cursor-not-allowed" /></div>
              </div>
              <div className="space-y-2"><label className="flex items-center gap-2 text-sm font-bold text-muted-foreground"><Mail size={16}/> Email Address</label><input name="email" defaultValue={user.email} disabled={!isEditing} className={`w-full p-3 rounded-xl font-medium transition-all ${isEditing ? 'bg-background border-2 border-blue-600' : 'bg-secondary/50 border-transparent'}`} /></div>
              <div className="space-y-2"><label className="flex items-center gap-2 text-sm font-bold text-muted-foreground"><Phone size={16}/> Contact Number</label><input name="contactNumber" defaultValue={user.contactNumber || ''} disabled={!isEditing} className={`w-full p-3 rounded-xl font-medium transition-all ${isEditing ? 'bg-background border-2 border-blue-600' : 'bg-secondary/50 border-transparent'}`} /></div>
              {isEditing && (<div className="pt-4 flex justify-end"><button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Save size={18} /> Save Changes</button></div>)}
            </form>
          </div>
        )}

        {/* --- TAB 2: SCHEDULE & SHIFT (FIXED PROPORTIONS) --- */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center pb-6 border-b border-border">
               <div>
                <h2 className="text-2xl font-black">My Schedule</h2>
                <p className="text-muted-foreground">Your assigned work hours and break times.</p>
              </div>
              <button 
                onClick={() => {
                   setIsRequestingTime(!isRequestingTime);
                   setRequestType('days');
                }}
                className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg text-xs font-bold transition"
              >
                {isRequestingTime ? 'Cancel Request' : 'Request Change'}
              </button>
            </div>

            {!isRequestingTime ? (
              <div className="flex flex-col gap-4">
                
                {/* 1. DAILY SHIFT CARD (Compact & Proportional) */}
                <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-5 shadow-sm">
                   
                   {/* Left: Compact Width (w-36) to save space */}
                   <div className="flex items-center gap-3 w-full md:w-36 shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-blue-900 leading-tight">Daily Shift</h3>
                        <p className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Regular</p>
                      </div>
                   </div>

                   {/* Divider */}
                   <div className="hidden md:block w-px h-10 bg-blue-200/60" />

                   {/* Right: Content (Horizontal Flow) */}
                   <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-8 md:gap-12">
                         <div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Start</p>
                            <p className="text-2xl font-black text-blue-900 tracking-tight leading-none">{formatTime(user.shiftStart)}</p>
                         </div>
                         <div className="h-8 w-px bg-blue-200/60 hidden md:block"></div>
                         <div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">End</p>
                            <p className="text-2xl font-black text-blue-900 tracking-tight leading-none">{formatTime(user.shiftEnd)}</p>
                         </div>
                      </div>
                      <span className="bg-white border border-blue-200 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase shadow-sm whitespace-nowrap">
                         1 Hr Break
                      </span>
                   </div>
                </div>

                {/* 2. WORK DAYS CARD (No Wrap) */}
                <div className="bg-card border border-border p-5 rounded-2xl flex flex-col md:flex-row items-center gap-5 shadow-sm">
                   
                   {/* Left: Compact Width (w-36) */}
                   <div className="flex items-center gap-3 w-full md:w-36 shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center">
                        <Calendar size={20} />
                      </div>
                       <div>
                        <h3 className="font-bold text-base leading-tight">Work Days</h3>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Weekly</p>
                      </div>
                   </div>
                   
                   {/* Divider */}
                   <div className="hidden md:block w-px h-10 bg-border" />

                   {/* Right: Days List (Forced One Line) */}
                   <div className="flex-1 w-full overflow-x-auto no-scrollbar">
                      <div className="flex flex-nowrap items-center justify-between md:justify-start gap-1.5 min-w-max">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                           <span key={day} className="h-8 w-11 flex items-center justify-center rounded-lg bg-foreground text-background font-bold text-xs shadow-sm cursor-default">
                             {day}
                           </span>
                        ))}
                        {/* Ghosted Weekend Badges */}
                        <span className="h-8 w-11 flex items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground font-bold text-xs opacity-50">Sat</span>
                        <span className="h-8 w-11 flex items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground font-bold text-xs opacity-50">Sun</span>
                      </div>
                   </div>
                </div>

              </div>
            ) : (
              /* REQUEST FORM (Unchanged) */
              <form action={async (formData) => {
                await requestScheduleChange(formData);
                setIsRequestingTime(false);
              }} className="bg-card border-2 border-dashed border-blue-200 p-6 rounded-3xl space-y-6">
                <input type="hidden" name="userId" value={user.id} />
                <div className="flex items-center gap-2 mb-2">
                   <h3 className="font-black text-xl text-blue-900">New Request</h3>
                   <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Draft</span>
                </div>
                {/* TABS */}
                <div className="flex p-1.5 bg-secondary/50 rounded-xl">
                  <button type="button" onClick={() => setRequestType('days')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${requestType === 'days' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-muted-foreground hover:text-foreground'}`}><Calendar size={16} /> Change Work Days</button>
                  <button type="button" onClick={() => setRequestType('time')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${requestType === 'time' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-muted-foreground hover:text-foreground'}`}><Clock size={16} /> Change Shift Times</button>
                </div>
                {/* TAB CONTENT */}
                {requestType === 'days' && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Proposed Weekly Schedule</label>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                       {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => (
                         <div key={day} className="flex flex-col gap-1">
                           <span className="text-[10px] font-bold text-center text-muted-foreground uppercase">{day}</span>
                           <div className="relative"><select name={`day-${i}`} className="w-full appearance-none p-2 pl-2 pr-6 bg-secondary/30 border border-border rounded-lg text-xs font-bold text-foreground focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer hover:border-blue-400 transition-colors text-center"><option value="">-</option><option value="ONSITE">🟢 On</option><option value="REMOTE">🟣 Rem</option><option value="OFF">🔴 Off</option></select><ChevronDown className="absolute right-1 top-2.5 text-muted-foreground pointer-events-none opacity-50" size={12} /></div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
                {requestType === 'time' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                    <div className="space-y-2"><label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Start</label><input name="startTime" type="time" className="w-full p-3 rounded-xl bg-secondary/30 border border-border focus:ring-2 focus:ring-blue-600 font-bold" /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New End</label><input name="endTime" type="time" className="w-full p-3 rounded-xl bg-secondary/30 border border-border focus:ring-2 focus:ring-blue-600 font-bold" /></div>
                  </div>
                )}
                <div className="space-y-2"><label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reason <span className="text-red-500">*</span></label><textarea name="reason" required placeholder={requestType === 'days' ? "e.g. I have classes on Mondays..." : "e.g. Need to adjust for childcare..."} className="w-full p-3 rounded-xl bg-secondary/30 border border-border min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm" /></div>
                <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">Submit Request</button>
              </form>
            )}
          </div>
        )}

        {/* --- TAB 3: TASKS --- */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="flex justify-between items-center pb-6 border-b border-border">
              <div><h2 className="text-2xl font-black">Assigned Tasks</h2><p className="text-muted-foreground">Check off your responsibilities.</p></div>
            </div>
            <div className="space-y-3">
              {tasks.length > 0 ? tasks.map((task) => (
                <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${task.isCompleted ? 'bg-secondary/30 border-transparent opacity-60' : 'bg-card border-border hover:border-blue-500/50'}`}>
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleTask(task.id, task.isCompleted)} className={`transition-colors ${task.isCompleted ? 'text-green-500' : 'text-muted-foreground hover:text-blue-500'}`}>{task.isCompleted ? <CheckCircle size={24} className="fill-green-500/20" /> : <Circle size={24} />}</button>
                    <div><h4 className={`font-bold ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</h4><p className="text-xs text-muted-foreground">Assigned by Admin</p></div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${task.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{task.isCompleted ? 'Completed' : 'Pending'}</span>
                </div>
              )) : (<div className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Briefcase size={48} className="mb-4 opacity-20" /><p>No tasks assigned yet.</p></div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
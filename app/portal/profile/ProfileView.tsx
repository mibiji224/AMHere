'use client';

import { useState } from 'react';
import { User, Mail, Phone, Clock, Calendar, CheckCircle, Circle, Edit2, Save, X, Briefcase, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { updateProfile, requestScheduleChange, toggleTask } from './actions';

interface ProfileViewProps {
  user: any;
  tasks: any[];
  linkedGoogle?: any;
  pendingEmailVerification?: any;
}

export default function ProfileView({ user, tasks }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState('details'); 
  const [isEditing, setIsEditing] = useState(false);
  const [isRequestingTime, setIsRequestingTime] = useState(false);
  const [requestType, setRequestType] = useState<'days' | 'time'>('days');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfileSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await updateProfile(formData);
      
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '--:--';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const tabs = [
    { id: 'details', label: 'Personal Details', icon: User },
    { id: 'schedule', label: 'Schedule & Shift', icon: Clock },
    { id: 'tasks', label: 'My Tasks', icon: CheckCircle },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* --- FOLDER TABS NAVIGATION --- */}
      <div className="flex items-end gap-2 px-4 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-6 py-3.5 rounded-t-xl text-sm font-bold transition-all border-t border-l border-r -mb-px
                ${isActive 
                  ? 'bg-card border-border border-b-card text-blue-600 dark:text-blue-400 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]' 
                  : 'bg-secondary/40 border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground top-[1px]'
                }
              `}
            >
              <Icon size={16} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'opacity-70'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- MAIN FOLDER CONTENT AREA --- */}
      <div className="bg-card border border-border border-t-0 rounded-b-2xl rounded-tr-2xl p-8 shadow-sm min-h-[500px]">
        
        {/* MESSAGE TOAST */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium text-sm">{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto opacity-60 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        )}

        {/* --- TAB 1: PERSONAL DETAILS --- */}
        {activeTab === 'details' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center pb-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-black">Personal Details</h2>
                <p className="text-muted-foreground">Manage your contact information.</p>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  isEditing 
                    ? 'bg-secondary text-foreground hover:bg-secondary/80' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500'
                }`}
              >
                {isEditing ? <><X size={16} /> Cancel Edit</> : <><Edit2 size={16} /> Edit Details</>}
              </button>
            </div>

            <form action={handleProfileSubmit} className="space-y-6">
              <input type="hidden" name="userId" value={user.id} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">First Name</label>
                  <input disabled value={user.firstName} className="w-full p-3 bg-secondary/50 rounded-xl font-bold opacity-70 cursor-not-allowed text-foreground" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Last Name</label>
                  <input disabled value={user.lastName} className="w-full p-3 bg-secondary/50 rounded-xl font-bold opacity-70 cursor-not-allowed text-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                  <Mail size={16}/> Email Address
                </label>
                <input 
                  name="email" 
                  type="email"
                  defaultValue={user.email} 
                  disabled={!isEditing} 
                  className={`w-full p-3 rounded-xl font-medium transition-all text-foreground ${
                    isEditing 
                      ? 'bg-background border-2 border-blue-600 dark:border-blue-500' 
                      : 'bg-secondary/50 border-transparent'
                  }`} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                  <Phone size={16}/> Contact Number
                </label>
                <input 
                  name="contactNumber" 
                  defaultValue={user.contactNumber || ''} 
                  disabled={!isEditing} 
                  placeholder="e.g. +63 912 345 6789"
                  className={`w-full p-3 rounded-xl font-medium transition-all text-foreground ${
                    isEditing 
                      ? 'bg-background border-2 border-blue-600 dark:border-blue-500' 
                      : 'bg-secondary/50 border-transparent'
                  }`} 
                />
              </div>
              
              {isEditing && (
                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* --- TAB 2: SCHEDULE & SHIFT --- */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-5 shadow-sm">
                   <div className="flex items-center gap-3 w-full md:w-36 shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-blue-900 dark:text-blue-100 leading-tight">Daily Shift</h3>
                        <p className="text-[10px] font-bold uppercase text-blue-400 dark:text-blue-300 tracking-wider">Regular</p>
                      </div>
                   </div>
                   <div className="hidden md:block w-px h-10 bg-blue-200/60 dark:bg-blue-700/30" />
                   <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-8 md:gap-12">
                         <div>
                            <p className="text-[10px] font-bold text-blue-400 dark:text-blue-300 uppercase tracking-widest mb-0.5">Start</p>
                            <p className="text-2xl font-black text-blue-900 dark:text-blue-100 tracking-tight leading-none">{formatTime(user.shiftStart)}</p>
                         </div>
                         <div className="h-8 w-px bg-blue-200/60 dark:bg-blue-700/30 hidden md:block"></div>
                         <div>
                            <p className="text-[10px] font-bold text-blue-400 dark:text-blue-300 uppercase tracking-widest mb-0.5">End</p>
                            <p className="text-2xl font-black text-blue-900 dark:text-blue-100 tracking-tight leading-none">{formatTime(user.shiftEnd)}</p>
                         </div>
                      </div>
                      <span className="bg-white dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-lg text-[10px] font-bold uppercase shadow-sm whitespace-nowrap">
                         1 Hr Break
                      </span>
                   </div>
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl flex flex-col md:flex-row items-center gap-5 shadow-sm">
                   <div className="flex items-center gap-3 w-full md:w-36 shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center">
                        <Calendar size={20} />
                      </div>
                       <div>
                        <h3 className="font-bold text-base leading-tight">Work Days</h3>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Weekly</p>
                      </div>
                   </div>
                   <div className="hidden md:block w-px h-10 bg-border" />
                   <div className="flex-1 w-full overflow-x-auto no-scrollbar">
                      <div className="flex flex-nowrap items-center justify-between md:justify-start gap-1.5 min-w-max">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                           <span key={day} className="h-8 w-11 flex items-center justify-center rounded-lg bg-foreground text-background font-bold text-xs shadow-sm cursor-default">
                             {day}
                           </span>
                        ))}
                        <span className="h-8 w-11 flex items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground font-bold text-xs opacity-50">Sat</span>
                        <span className="h-8 w-11 flex items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground font-bold text-xs opacity-50">Sun</span>
                      </div>
                   </div>
                </div>

              </div>
            ) : (
              <form action={async (formData) => {
                await requestScheduleChange(formData);
                setIsRequestingTime(false);
              }} className="bg-card border-2 border-dashed border-blue-200 dark:border-blue-800 p-6 rounded-3xl space-y-6">
                <input type="hidden" name="userId" value={user.id} />
                <div className="flex items-center gap-2 mb-2">
                   <h3 className="font-black text-xl text-blue-900 dark:text-blue-100">New Request</h3>
                   <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Draft</span>
                </div>
                
                <div className="flex p-1.5 bg-secondary/50 rounded-xl">
                  <button type="button" onClick={() => setRequestType('days')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${requestType === 'days' ? 'bg-background text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:text-foreground'}`}><Calendar size={16} /> Change Work Days</button>
                  <button type="button" onClick={() => setRequestType('time')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${requestType === 'time' ? 'bg-background text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:text-foreground'}`}><Clock size={16} /> Change Shift Times</button>
                </div>

                {requestType === 'days' && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Proposed Weekly Schedule</label>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                       {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => (
                         <div key={day} className="flex flex-col gap-1">
                           <span className="text-[10px] font-bold text-center text-muted-foreground uppercase">{day}</span>
                           <div className="relative">
                             <select name={`day-${i}`} className="w-full appearance-none p-2 pl-2 pr-6 bg-secondary/30 border border-border rounded-lg text-xs font-bold text-foreground focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer hover:border-blue-400 transition-colors text-center">
                               <option value="">-</option>
                               {/* REMOVED EMOJIS HERE: */}
                               <option value="ONSITE">Onsite</option>
                               <option value="REMOTE">Remote</option>
                               <option value="OFF">Off</option>
                             </select>
                             <ChevronDown className="absolute right-1 top-2.5 text-muted-foreground pointer-events-none opacity-50" size={12} />
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {requestType === 'time' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Start</label>
                      {/* UPDATED: iOS Style Time Picker (Gray Pill, No Border, Centered) */}
                      <input 
                        name="startTime" 
                        type="time" 
                        className="w-full p-4 rounded-xl bg-gray-100 dark:bg-white/5 border-none text-center font-bold text-lg text-blue-600 dark:text-blue-400 focus:ring-0 focus:bg-gray-200 dark:focus:bg-white/10 transition-all cursor-pointer appearance-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New End</label>
                      {/* UPDATED: iOS Style Time Picker */}
                      <input 
                        name="endTime" 
                        type="time" 
                        className="w-full p-4 rounded-xl bg-gray-100 dark:bg-white/5 border-none text-center font-bold text-lg text-blue-600 dark:text-blue-400 focus:ring-0 focus:bg-gray-200 dark:focus:bg-white/10 transition-all cursor-pointer appearance-none" 
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reason <span className="text-red-500">*</span></label>
                  <textarea name="reason" required placeholder={requestType === 'days' ? "e.g. I have classes on Mondays..." : "e.g. Need to adjust for childcare..."} className="w-full p-3 rounded-xl bg-secondary/30 border border-border min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-foreground" />
                </div>
                <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all">Submit Request</button>
              </form>
            )}
          </div>
        )}

        {/* --- TAB 3: TASKS --- */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${task.isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>{task.isCompleted ? 'Completed' : 'Pending'}</span>
                </div>
              )) : (<div className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Briefcase size={48} className="mb-4 opacity-20" /><p>No tasks assigned yet.</p></div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
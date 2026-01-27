'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, Mail, Phone, Clock, Calendar, CheckCircle, Circle, Edit2, Save, X, Briefcase, ChevronDown, AlertCircle, Loader2, Link2, Unlink } from 'lucide-react';
import { updateProfile, requestScheduleChange, toggleTask, unlinkGoogleAccount } from './actions';

interface LinkedGoogle {
  email: string;
  name: string | null;
  picture: string | null;
  linkedAt: string;
}

interface ProfileViewProps {
  user: any;
  tasks: any[];
  linkedGoogle: LinkedGoogle | null;
}

export default function ProfileView({ user, tasks, linkedGoogle }: ProfileViewProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('schedule');
  const [isEditing, setIsEditing] = useState(false);
  const [isRequestingTime, setIsRequestingTime] = useState(false);
  const [requestType, setRequestType] = useState<'days' | 'time'>('days');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'google_linked') {
      setMessage({ type: 'success', text: 'Google account linked successfully!' });
    } else if (error === 'google_auth_cancelled') {
      setMessage({ type: 'info', text: 'Google account linking was cancelled.' });
    } else if (error === 'google_already_linked') {
      setMessage({ type: 'error', text: 'This Google account is already linked to another user.' });
    } else if (error === 'link_failed') {
      setMessage({ type: 'error', text: 'Failed to link Google account. Please try again.' });
    } else if (error === 'oauth_not_configured') {
      setMessage({ type: 'error', text: 'Google OAuth is not configured. Please contact your administrator.' });
    }

    if (success || error) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

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

  const handleUnlinkGoogle = async () => {
    if (!confirm('Are you sure you want to unlink your Google account?')) return;

    setIsUnlinking(true);
    try {
      const result = await unlinkGoogleAccount(user.id);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Google account unlinked.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to unlink account' });
    } finally {
      setIsUnlinking(false);
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

        {/* Global Message Toast */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
            message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
            'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {message.type === 'success' && <CheckCircle size={20} />}
            {message.type === 'error' && <AlertCircle size={20} />}
            {message.type === 'info' && <Mail size={20} />}
            <span className="font-medium text-sm">{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto opacity-60 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        )}

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

            {/* Linked Google Account Section */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden">
                    {linkedGoogle?.picture ? (
                      <img src={linkedGoogle.picture} alt="Google" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      Google Account
                      {linkedGoogle && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                          Linked
                        </span>
                      )}
                    </h4>
                    {linkedGoogle ? (
                      <p className="text-sm text-slate-600">{linkedGoogle.email}</p>
                    ) : (
                      <p className="text-sm text-slate-500">No Google account linked</p>
                    )}
                  </div>
                </div>

                {linkedGoogle ? (
                  <button
                    onClick={handleUnlinkGoogle}
                    disabled={isUnlinking}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    {isUnlinking ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Unlink size={16} />
                    )}
                    Unlink
                  </button>
                ) : (
                  <a
                    href={`/api/link-google?userId=${user.id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    <Link2 size={16} />
                    Link Google Account
                  </a>
                )}
              </div>
            </div>

            <form action={handleProfileSubmit} className="space-y-6">
              <input type="hidden" name="userId" value={user.id} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">First Name</label>
                  <input disabled value={user.firstName} className="w-full p-3 bg-secondary/50 rounded-xl font-bold opacity-70 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Last Name</label>
                  <input disabled value={user.lastName} className="w-full p-3 bg-secondary/50 rounded-xl font-bold opacity-70 cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                  <Mail size={16}/> Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full p-3 bg-secondary/50 rounded-xl font-medium opacity-70 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email is managed by your administrator.
                </p>
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
                  className={`w-full p-3 rounded-xl font-medium transition-all ${isEditing ? 'bg-background border-2 border-blue-600' : 'bg-secondary/50 border-transparent'}`}
                />
              </div>

              {isEditing && (
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"
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

                <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-5 shadow-sm">
                   <div className="flex items-center gap-3 w-full md:w-36 shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-blue-900 leading-tight">Daily Shift</h3>
                        <p className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Regular</p>
                      </div>
                   </div>
                   <div className="hidden md:block w-px h-10 bg-blue-200/60" />
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
              }} className="bg-card border-2 border-dashed border-blue-200 p-6 rounded-3xl space-y-6">
                <input type="hidden" name="userId" value={user.id} />
                <div className="flex items-center gap-2 mb-2">
                   <h3 className="font-black text-xl text-blue-900">New Request</h3>
                   <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Draft</span>
                </div>
                <div className="flex p-1.5 bg-secondary/50 rounded-xl">
                  <button type="button" onClick={() => setRequestType('days')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${requestType === 'days' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-muted-foreground hover:text-foreground'}`}><Calendar size={16} /> Change Work Days</button>
                  <button type="button" onClick={() => setRequestType('time')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${requestType === 'time' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-muted-foreground hover:text-foreground'}`}><Clock size={16} /> Change Shift Times</button>
                </div>
                {requestType === 'days' && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Proposed Weekly Schedule</label>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                       {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => (
                         <div key={day} className="flex flex-col gap-1">
                           <span className="text-[10px] font-bold text-center text-muted-foreground uppercase">{day}</span>
                           <div className="relative"><select name={`day-${i}`} className="w-full appearance-none p-2 pl-2 pr-6 bg-secondary/30 border border-border rounded-lg text-xs font-bold text-foreground focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer hover:border-blue-400 transition-colors text-center"><option value="">-</option><option value="ONSITE">On</option><option value="REMOTE">Rem</option><option value="OFF">Off</option></select><ChevronDown className="absolute right-1 top-2.5 text-muted-foreground pointer-events-none opacity-50" size={12} /></div>
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

'use client'

import { useState } from 'react';
import { registerEmployee } from '@/app/actions'; // We will update this action next

export default function RegisterModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm shadow-md transition flex items-center gap-2"
      >
        <span>+</span> Register New Account
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-border flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/20">
              <div>
                <h2 className="text-xl font-bold text-foreground">New Employee Registration</h2>
                <p className="text-sm text-muted-foreground">Enter bio-data and initial schedule.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {/* Form */}
            <form action={async (formData) => {
              await registerEmployee(formData);
              setIsOpen(false);
            }} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">First Name</label>
                  <input name="firstName" required className="w-full bg-background border border-input rounded-lg p-2.5 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Last Name</label>
                  <input name="lastName" required className="w-full bg-background border border-input rounded-lg p-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Email</label>
                  <input name="email" type="email" required className="w-full bg-background border border-input rounded-lg p-2.5 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Birthday</label>
                  <input name="birthday" type="date" required className="w-full bg-background border border-input rounded-lg p-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Employee ID</label>
                  <input name="employeeId" required placeholder="000000" className="w-full bg-background border border-input rounded-lg p-2.5 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Position</label>
                  <input name="position" required className="w-full bg-background border border-input rounded-lg p-2.5 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Rate ($/hr)</label>
                  <input name="hourlyRate" type="number" step="0.01" required className="w-full bg-background border border-input rounded-lg p-2.5 text-sm" />
                </div>
              </div>

              {/* Initial Schedule Setup */}
              <div className="space-y-2 pt-2 border-t border-border">
                 <label className="text-xs font-bold uppercase text-muted-foreground">Initial Work Schedule</label>
                 <div className="grid grid-cols-7 gap-2 text-center">
                   {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                     <div key={day} className="flex flex-col gap-1">
                       <span className="text-[10px] font-bold">{day}</span>
                       <select name={`day-${idx}`} className="text-xs bg-secondary border border-border rounded p-1">
                         <option value="REST">Rest</option>
                         <option value="ONSITE">Onsite</option>
                         <option value="REMOTE">Remote</option>
                       </select>
                     </div>
                   ))}
                 </div>
              </div>

              <div className="pt-4">
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition">
                  Create Employee Account
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
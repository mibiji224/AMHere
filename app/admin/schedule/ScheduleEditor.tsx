'use client'

import { useState } from 'react';
import { saveSchedule } from './actions';

type ScheduleProps = {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    schedules: { dayOfWeek: number; workType: string }[];
  };
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ScheduleEditor({ employee }: ScheduleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getDayStatus = (dayIndex: number) => {
    const found = employee.schedules.find(s => s.dayOfWeek === dayIndex);
    return found ? found.workType : 'REST';
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-primary bg-primary/10 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition"
      >
        {isOpen ? 'Close' : 'Manage Schedule'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          {/* 👇 FIX: Use 'bg-card' (White in Day, Dark in Night) */}
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-border">
            
            {/* 👇 FIX: Use 'bg-primary' (Blue) instead of 'bg-slate-900' (Black) */}
            <div className="bg-primary p-6 flex justify-between items-center">
              <h3 className="text-primary-foreground font-bold text-lg">
                Schedule for {employee.firstName}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground transition">✕</button>
            </div>

            <form action={async (formData) => {
                await saveSchedule(employee.id, formData);
                setIsOpen(false);
            }} className="p-6 space-y-4">
              
              <div className="grid gap-3">
                {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => (
                  <div key={dayIndex} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                    <label className="font-medium text-foreground w-24">
                      {DAYS[dayIndex]}
                    </label>
                    
                    {/* 👇 FIX: Use 'bg-background' and 'text-foreground' for inputs */}
                    <select 
                      name={`day-${dayIndex}`} 
                      defaultValue={getDayStatus(dayIndex)}
                      className="bg-background border border-input text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none w-40"
                    >
                      <option value="REST">Rest Day</option>
                      <option value="ONSITE">Onsite</option>
                      <option value="REMOTE">Remote</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 shadow-md transition"
                >
                  Save Schedule
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
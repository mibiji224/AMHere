'use client'

import { useState } from 'react';
import { saveAllSchedules } from './actions'; 

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  schedules: { dayOfWeek: number; workType: string }[];
};

export default function ScheduleEditor({ employees }: { employees: Employee[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      
      {/* 1. WRAP EVERYTHING IN ONE FORM */}
      <form action={async (formData) => {
        await saveAllSchedules(formData);
        setIsEditing(false); // Turn off edit mode after saving
      }}>

        {/* TOOLBAR */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
          <h2 className="font-bold text-foreground">Weekly Schedule Editor</h2>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold border border-border bg-background hover:bg-secondary transition"
                >
                  Cancel
                </button>
                {/* 👇 SAVE BUTTON NOW AT THE TOP */}
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-green-600 hover:bg-green-700 text-white transition shadow-sm"
                >
                  💾 Save Changes
                </button>
              </>
            ) : (
              <button 
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition"
              >
                ✎ Edit Schedules
              </button>
            )}
          </div>
        </div>

        {/* TABLE HEADER */}
        <div className="grid grid-cols-[250px_1fr] gap-4 px-6 py-3 border-b border-border bg-secondary/50 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
          <div>Employee</div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {days.map(d => <span key={d}>{d}</span>)}
          </div>
        </div>

        {/* SCHEDULE ROWS */}
        <div className="divide-y divide-border">
          {employees.map((emp) => (
            <div key={emp.id} className="grid grid-cols-[250px_1fr] gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors items-center">
              
              {/* NAME COLUMN */}
              <div className="pr-4 truncate">
                <div className="font-bold text-foreground truncate">{emp.firstName} {emp.lastName}</div>
                <div className="text-xs text-muted-foreground truncate">{emp.position}</div>
              </div>

              {/* WEEKLY GRID */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((_, dayIndex) => {
                  const currentSchedule = emp.schedules.find(s => s.dayOfWeek === dayIndex);
                  const type = currentSchedule?.workType || 'REST';

                  return (
                    <div key={dayIndex} className="flex flex-col">
                      {isEditing ? (
                        // EDIT MODE: Selects with unique names per user/day
                        <select 
                          name={`${emp.id}:::${dayIndex}`} 
                          defaultValue={type}
                          className={`
                            w-full text-[10px] p-1 rounded border outline-none focus:ring-2 focus:ring-primary font-medium
                            ${type === 'ONSITE' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : ''}
                            ${type === 'REMOTE' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' : ''}
                            ${type === 'REST' ? 'bg-secondary text-muted-foreground border-border' : ''}
                          `}
                        >
                          <option value="REST">-</option>
                          <option value="ONSITE">Onsite</option>
                          <option value="REMOTE">Remote</option>
                        </select>
                      ) : (
                        // VIEW MODE: Colored Badges
                        <div className={`
                          h-9 rounded-md flex items-center justify-center text-[10px] font-bold border
                          ${type === 'ONSITE' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : ''}
                          ${type === 'REMOTE' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' : ''}
                          ${type === 'REST' ? 'bg-secondary/50 text-muted-foreground border-transparent opacity-40' : ''}
                        `}>
                          {type === 'REST' ? '—' : type.slice(0,3)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
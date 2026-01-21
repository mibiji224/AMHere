'use client'

import { useState } from 'react';
import { saveAllSchedules } from './actions'; 
import { addDays, isWithinInterval, startOfDay } from 'date-fns';

type Leave = {
  id: string;
  startDate: Date;
  endDate: Date;
  type: 'PAID' | 'UNPAID';
  userId: string;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  leaveCredits: number;
  schedules: { dayOfWeek: number; workType: string }[];
};

export default function ScheduleEditor({ 
  employees, 
  currentWeekStart, 
  approvedLeaves 
}: { 
  employees: Employee[], 
  currentWeekStart: Date,
  approvedLeaves: Leave[]
}) {
  const [isEditing, setIsEditing] = useState(false);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      
      <form action={async (formData) => {
        await saveAllSchedules(formData);
        setIsEditing(false);
      }}>

        {/* TOOLBAR */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
          <h2 className="font-bold text-foreground">Weekly Roster</h2>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg text-xs font-bold border border-border bg-background hover:bg-secondary transition">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold bg-green-600 hover:bg-green-700 text-white shadow-sm transition">Save Changes</button>
              </>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition">✎ Edit Default Schedule</button>
            )}
          </div>
        </div>

        {/* HEADER */}
        <div className="grid grid-cols-[250px_1fr] gap-4 px-6 py-3 border-b border-border bg-secondary/50 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
          <div>Employee</div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {days.map((d, i) => (
              <div key={d} className="flex flex-col">
                <span>{d}</span>
                <span className="text-[9px] opacity-70">
                  {addDays(currentWeekStart, i).getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ROWS */}
        <div className="divide-y divide-border">
          {employees.map((emp) => (
            <div key={emp.id} className="grid grid-cols-[250px_1fr] gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors items-center">
              
              {/* NAME COLUMN (Credits Removed) */}
              <div className="pr-4 truncate">
                <div className="font-bold text-foreground truncate">{emp.firstName} {emp.lastName}</div>
                <div className="text-xs text-muted-foreground truncate">{emp.position}</div>
                
                {/* 🗑️ REMOVED: The Credits Badge Code was here */}
              </div>

              {/* WEEKLY GRID */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((_, dayIndex) => {
                  const cellDate = addDays(currentWeekStart, dayIndex);
                  
                  // Check for Leaves
                  const activeLeave = approvedLeaves.find(leave => 
                    leave.userId === emp.id && 
                    isWithinInterval(cellDate, { 
                      start: startOfDay(new Date(leave.startDate)), 
                      end: startOfDay(new Date(leave.endDate)) 
                    })
                  );

                  const currentSchedule = emp.schedules.find(s => s.dayOfWeek === dayIndex);
                  const type = currentSchedule?.workType || 'REST';

                  // RENDER CELL
                  if (activeLeave) {
                    return (
                      <div key={dayIndex} className={`
                        h-9 rounded-md flex flex-col items-center justify-center text-[8px] font-bold border leading-tight
                        ${activeLeave.type === 'PAID' 
                          ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-500 dark:border-amber-800' 
                          : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-500 dark:border-red-800'}
                      `}>
                        <span>{activeLeave.type === 'PAID' ? 'PAID' : 'NO PAY'}</span>
                        <span>LEAVE</span>
                      </div>
                    );
                  }

                  return (
                    <div key={dayIndex} className="flex flex-col">
                      {isEditing ? (
                        <select 
                          name={`${emp.id}:::${dayIndex}`} 
                          defaultValue={type}
                          className={`
                            w-full text-[10px] p-1 rounded border outline-none font-medium
                            ${type === 'ONSITE' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : ''}
                            ${type === 'REMOTE' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' : ''}
                          `}
                        >
                          <option value="REST">-</option>
                          <option value="ONSITE">Onsite</option>
                          <option value="REMOTE">Remote</option>
                        </select>
                      ) : (
                        <div className={`
                          h-9 rounded-md flex items-center justify-center text-[10px] font-bold border
                          ${type === 'ONSITE' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : ''}
                          ${type === 'REMOTE' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' : ''}
                          ${type === 'REST' ? 'bg-secondary/50 text-muted-foreground border-transparent opacity-40' : ''}
                        `}>
                          {type === 'REST' ? '—' : type}
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
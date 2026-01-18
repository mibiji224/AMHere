'use client'

import { useState } from 'react';
import CalendarView from './CalendarView';
import ScheduleEditor from './ScheduleEditor';

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  schedules: { dayOfWeek: number; workType: string }[];
};

export default function ScheduleContainer({ employees }: { employees: Employee[] }) {
  const [activeTab, setActiveTab] = useState<'LIST' | 'CALENDAR'>('LIST');

  return (
    <div>
      <div className="flex bg-muted p-1 rounded-xl w-fit mb-6 border border-border">
        <button 
          onClick={() => setActiveTab('LIST')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'LIST' 
              ? 'bg-background shadow text-primary' 
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          Weekly Settings
        </button>
        <button 
          onClick={() => setActiveTab('CALENDAR')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'CALENDAR' 
              ? 'bg-background shadow text-primary' 
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          Calendar View
        </button>
      </div>

      {/* CONTENT AREA */}
      {activeTab === 'LIST' ? (
        <div className="grid gap-4">
          {employees.map(emp => (
            <div key={emp.id} className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
              
              <div className="flex items-center gap-4">
                  {/* AVATAR: Added dark mode colors */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold transition-colors">
                      {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div>
                      {/* NAME & POSITION: Added dark mode text colors */}
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 transition-colors">
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
                        {emp.position}
                      </p>
                  </div>
              </div>

              {/* Mini Week Preview */}
              <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 0].map(d => {
                      const shift = emp.schedules.find(s => s.dayOfWeek === d);
                      
                      // DEFAULT: Light grey for empty days, Dark grey for dark mode
                      let color = 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600';
                      
                      // ONSITE: Blue
                      if (shift?.workType === 'ONSITE') {
                        color = 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300';
                      }
                      
                      // REMOTE: Purple
                      if (shift?.workType === 'REMOTE') {
                        color = 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300';
                      }

                      return (
                          <div key={d} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${color}`}>
                              {['S','M','T','W','T','F','S'][d]}
                          </div>
                      )
                  })}
              </div>

              <ScheduleEditor employee={emp} />
            </div>
          ))}
        </div>
      ) : (
        <CalendarView employees={employees} />
      )}
    </div>
  );
}
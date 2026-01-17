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
        // THIS IS THE OLD LIST VIEW CODE, WRAPPED HERE
        <div className="grid gap-4">
          {employees.map(emp => (
            <div key={emp.id} className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div>
                      <h3 className="font-bold text-gray-900">{emp.firstName} {emp.lastName}</h3>
                      <p className="text-sm text-gray-500">{emp.position}</p>
                  </div>
              </div>

              {/* Mini Week Preview */}
              <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 0].map(d => {
                      const shift = emp.schedules.find(s => s.dayOfWeek === d);
                      let color = 'bg-gray-100 text-gray-300';
                      if (shift?.workType === 'ONSITE') color = 'bg-blue-100 text-blue-600';
                      if (shift?.workType === 'REMOTE') color = 'bg-purple-100 text-purple-600';
                      return (
                          <div key={d} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${color}`}>
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
        // NEW CALENDAR VIEW
        <CalendarView employees={employees} />
      )}
    </div>
  );
}
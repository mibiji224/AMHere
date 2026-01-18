'use client'

import { useState } from 'react';
import CalendarView from './CalendarView';
import ScheduleEditor from './ScheduleEditor';
import { addDays, startOfWeek, format } from 'date-fns';

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
  leaveRequests: Leave[];
};

export default function ScheduleContainer({ employees }: { employees: Employee[] }) {
  const [activeTab, setActiveTab] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));

  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const approvedLeaves = employees.flatMap(e => e.leaveRequests || []); 

  return (
    <div>
      {/* HEADER: TABS + DATE NAVIGATOR */}
      <div className="flex flex-col sm:flex-row justify-between items-end mb-6 gap-4">
        
        {/* 1. TAB BUTTONS */}
        <div className="flex bg-muted p-1 rounded-xl w-fit border border-border">
          <button 
            onClick={() => setActiveTab('LIST')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'LIST' 
                ? 'bg-background shadow text-primary' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            Weekly Roster
          </button>
          <button 
            onClick={() => setActiveTab('CALENDAR')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'CALENDAR' 
                ? 'bg-background shadow text-primary' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            Daily View
          </button>
        </div>

        {/* 2. DATE NAVIGATOR (Perfectly Centered Fix) */}
        {activeTab === 'LIST' && (
          // 👇 Added 'items-center' and 'gap-2'
          <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border shadow-sm">
             
             {/* LEFT ARROW: Fixed Square Size */}
             <button 
               onClick={prevWeek} 
               className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition"
             >
               ←
             </button>
             
             {/* TEXT: Fixed Width to prevent jumping */}
             <div className="text-sm font-bold text-foreground min-w-[160px] text-center select-none">
               {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
             </div>
             
             {/* RIGHT ARROW: Fixed Square Size */}
             <button 
               onClick={nextWeek} 
               className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition"
             >
               →
             </button>
          </div>
        )}
      </div>

      {/* 3. CONTENT AREA */}
      {activeTab === 'LIST' ? (
        <ScheduleEditor 
          employees={employees} 
          currentWeekStart={currentWeekStart} 
          approvedLeaves={approvedLeaves}     
        />
      ) : (
        <CalendarView employees={employees} />
      )}
    </div>
  );
}
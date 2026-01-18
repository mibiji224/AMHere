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
      {/* 1. TAB BUTTONS */}
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

      {/* 2. CONTENT AREA */}
      {activeTab === 'LIST' ? (
        // ✅ CORRECT: Pass the full array. No .map() here!
        <ScheduleEditor employees={employees} />
      ) : (
        // ✅ Calendar View also takes the full array
        <CalendarView employees={employees} />
      )}
    </div>
  );
}
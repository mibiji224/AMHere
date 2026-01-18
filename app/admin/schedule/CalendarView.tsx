'use client'

import { useState } from 'react';

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  schedules: { dayOfWeek: number; workType: string }[];
};

export default function CalendarView({ employees }: { employees: Employee[] }) {
  // Default to today
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // 1. Get the Day of Week for the selected date (0=Sun, 1=Mon, etc.)
  const dateObj = new Date(selectedDate);
  const dayOfWeek = dateObj.getDay(); // Returns 0-6

  // 2. Filter Employees based on this day
  const onsiteStaff = employees.filter(emp => 
    emp.schedules.some(s => s.dayOfWeek === dayOfWeek && s.workType === 'ONSITE')
  );

  const remoteStaff = employees.filter(emp => 
    emp.schedules.some(s => s.dayOfWeek === dayOfWeek && s.workType === 'REMOTE')
  );

  return (
    <div className="space-y-6">
      
      {/* Date Picker Header */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-card-foreground">Daily Roster</h2>
          <p className="text-muted-foreground">Check who is scheduled for specific dates.</p>
        </div>
        <div className="flex items-center gap-3 bg-muted p-2 rounded-lg border border-border">
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-2">Select Date:</span>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-background border border-input text-foreground text-sm rounded-md focus:ring-2 focus:ring-ring focus:border-ring block p-2 outline-none font-bold"
          />
        </div>
      </div>

      {/* The Roster Display */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* ONSITE COLUMN */}
        {/* FIX: Added dark:bg-blue-900/20 and dark:border-blue-800 */}
        <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50 overflow-hidden transition-colors">
          <div className="bg-blue-100/50 dark:bg-blue-900/40 px-6 py-4 border-b border-blue-200 dark:border-blue-800 flex justify-between items-center">
            {/* FIX: Added dark:text-blue-100 */}
            <h3 className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              Onsite Staff
            </h3>
            <span className="bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200 text-xs font-bold px-2 py-1 rounded-full">
              {onsiteStaff.length}
            </span>
          </div>
          <div className="p-4 space-y-2">
            {onsiteStaff.length > 0 ? (
              onsiteStaff.map(emp => (
                <div key={emp.id} className="bg-background p-3 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      {/* FIX: Added dark:text-gray-100 */}
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{emp.firstName} {emp.lastName}</p>
                      {/* FIX: Lighter blue text for dark mode */}
                      <p className="text-xs text-blue-600/80 dark:text-blue-400">{emp.position}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8 text-sm italic">No one scheduled onsite.</p>
            )}
          </div>
        </div>

        {/* REMOTE COLUMN */}
        {/* FIX: Added dark:bg-purple-900/20 and dark:border-purple-800 */}
        <div className="bg-purple-50/50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-900/50 overflow-hidden transition-colors">
          <div className="bg-purple-100/50 dark:bg-purple-900/40 px-6 py-4 border-b border-purple-200 dark:border-purple-800 flex justify-between items-center">
            {/* FIX: Added dark:text-purple-100 */}
            <h3 className="font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              Remote Staff
            </h3>
            <span className="bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200 text-xs font-bold px-2 py-1 rounded-full">
              {remoteStaff.length}
            </span>
          </div>
          <div className="p-4 space-y-2">
            {remoteStaff.length > 0 ? (
              remoteStaff.map(emp => (
                <div key={emp.id} className="bg-background p-3 rounded-lg border border-purple-100 dark:border-purple-900 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      {/* FIX: Added dark:text-gray-100 */}
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-purple-600/80 dark:text-purple-400">{emp.position}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8 text-sm italic">No remote staff scheduled.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
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

  // Helper to find current setting for a day
  const getDayStatus = (dayIndex: number) => {
    const found = employee.schedules.find(s => s.dayOfWeek === dayIndex);
    return found ? found.workType : 'REST';
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-600 bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
      >
        {isOpen ? 'Close' : 'Manage Schedule'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">
                Schedule for {employee.firstName}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">✕</button>
            </div>

            <form action={async (formData) => {
                await saveSchedule(employee.id, formData);
                setIsOpen(false);
            }} className="p-6 space-y-4">
              
              <div className="grid gap-3">
                {/* Loop 1-6 (Mon-Sat) first, then 0 (Sun) at the end */}
                {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => (
                  <div key={dayIndex} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
                    <label className="font-medium text-gray-700 w-24">
                      {DAYS[dayIndex]}
                    </label>
                    
                    <select 
                      name={`day-${dayIndex}`} 
                      defaultValue={getDayStatus(dayIndex)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-40"
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
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
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
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { useRef } from 'react';

export default function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get date from URL or default to Today
  const dateParam = searchParams.get('date');
  // Handle timezone offset to ensure the date doesn't shift back by 1 day
  const dateValue = dateParam ? new Date(dateParam) : new Date();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (!newDate) return;
    router.push(`/admin/dashboard?date=${newDate}`);
  };

  // Function to programmatically open the calendar
  const openCalendar = () => {
    if (inputRef.current) {
      try {
        inputRef.current.showPicker(); // Modern browsers
      } catch (error) {
        inputRef.current.click(); // Fallback
      }
    }
  };

  return (
    <div className="relative">
      {/* VISUAL BUTTON (Clicking this opens the calendar) */}
      <button 
        onClick={openCalendar}
        className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition shadow-sm"
      >
        <Calendar size={14} /> 
        {/* Format date nicely (e.g., "Mon, Jan 23, 2026") */}
        {dateValue.toLocaleDateString(undefined, { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}
      </button>

      {/* HIDDEN INPUT (Handles the actual selection) */}
      <input 
        ref={inputRef}
        type="date" 
        className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0" // Hidden completely
        onChange={handleChange}
        // Fix: Ensure the value matches the YYYY-MM-DD format exactly
        defaultValue={dateParam || new Date().toISOString().split('T')[0]}
      />
    </div>
  );
}
'use client'

import { useRef } from 'react';
// 👇 FIX: Import 'registerEmployee' (not createEmployee)
import { registerEmployee } from '../actions';

export default function AddEmployeeForm() {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm mb-8">
      <h3 className="text-lg font-bold text-foreground mb-4">Add New Employee</h3>
      
      <form 
        ref={ref} 
        action={async (formData) => {
          // 👇 FIX: Use the correct function name here too
          await registerEmployee(formData);
          ref.current?.reset();
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
      >
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">First Name</label>
          <input type="text" name="firstName" placeholder="e.g. John" required className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-ring transition" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Name</label>
          <input type="text" name="lastName" placeholder="e.g. Doe" required className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-ring transition" />
        </div>

        <div className="space-y-1 lg:col-span-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</label>
          <input type="email" name="email" placeholder="john@company.com" required className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-ring transition" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Position</label>
          <input type="text" name="position" placeholder="Dev" className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-ring transition" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rate ($)</label>
          <div className="flex gap-2">
            <input type="number" step="0.01" name="hourlyRate" placeholder="0.00" className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-ring transition" />
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-bold transition shadow-sm">
              Add
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
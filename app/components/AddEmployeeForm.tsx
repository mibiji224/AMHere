'use client'

import { createEmployee } from '../actions';
import { useRef } from 'react';

export default function AddEmployeeForm() {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Employee</h3>
      
      <form 
        ref={ref}
        action={async (formData) => {
          await createEmployee(formData); // Call the server action
          ref.current?.reset(); // Clear the form after saving
        }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <input name="firstName" placeholder="First Name" required className="border p-2 rounded" />
        <input name="lastName" placeholder="Last Name" required className="border p-2 rounded" />
        <input type="email" name="email" placeholder="Email" required className="border p-2 rounded" />
        <input name="position" placeholder="Position (e.g. Developer)" required className="border p-2 rounded" />
        
        <div className="flex gap-2">
            <input type="number" name="hourlyRate" placeholder="Rate ($)" required className="border p-2 rounded w-full" step="0.01" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Add
            </button>
        </div>
      </form>
    </div>
  );
}
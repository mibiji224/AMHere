'use client'

import { createEmployee } from '../actions';
import { useFormStatus } from 'react-dom';
import { useRef } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 h-[42px]"
    >
      {pending ? 'Adding...' : 'Add'}
    </button>
  );
}

export default function AddEmployeeForm() {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Employee</h2>
      
      <form 
        ref={ref}
        action={async (formData) => {
          await createEmployee(formData);
          ref.current?.reset();
        }} 
        className="flex gap-4 items-end"
      >
        <div className="grid grid-cols-4 gap-4 flex-1">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">First Name</label>
            <input 
              name="firstName" 
              placeholder="e.g. John" 
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Last Name</label>
            <input 
              name="lastName" 
              placeholder="e.g. Doe" 
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email</label>
            <input 
              name="email" 
              placeholder="john@company.com" 
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
               <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Position</label>
               <input 
                 name="position" 
                 placeholder="Dev" 
                 required
                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
               />
            </div>
            <div>
               <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Rate ($)</label>
               <input 
                 name="hourlyRate" 
                 placeholder="15.00" 
                 type="number"
                 step="0.01"
                 required
                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
               />
            </div>
          </div>
        </div>
        
        <SubmitButton />
      </form>
    </div>
  );
}
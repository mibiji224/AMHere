'use client'

import { useState } from 'react';
import { login } from './action';
import { useFormStatus } from 'react-dom';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      className="w-full bg-white/20 hover:bg-white/30 text-white font-bold p-4 rounded-xl backdrop-blur-md border border-white/20 transition-all active:scale-95 disabled:opacity-50 shadow-lg mt-4"
    >
      {pending ? 'Checking...' : label}
    </button>
  );
}

export default function LoginPage() {
  const [userType, setUserType] = useState<'ADMIN' | 'EMPLOYEE'>('EMPLOYEE');

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>

      <div className="relative bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full">
        
        {/* Toggle Switch */}
        <div className="flex bg-black/20 p-1 rounded-xl mb-8 relative">
          <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/20 rounded-lg transition-all duration-300 ${userType === 'ADMIN' ? 'left-[calc(50%+2px)]' : 'left-1'}`}></div>
          <button 
            onClick={() => setUserType('EMPLOYEE')}
            className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${userType === 'EMPLOYEE' ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
          >
            Employee
          </button>
          <button 
            onClick={() => setUserType('ADMIN')}
            className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${userType === 'ADMIN' ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
          >
            Admin
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {userType === 'ADMIN' ? 'Admin Access' : 'Hello Team!'}
          </h1>
          <p className="text-blue-200/60 text-sm mt-2">
            {userType === 'ADMIN' ? 'Secure System Login' : 'Enter your details to start work'}
          </p>
        </div>

        <form action={login} className="space-y-4">
          {/* Hidden field to tell server which mode we are in */}
          <input type="hidden" name="loginType" value={userType} />

          {userType === 'ADMIN' ? (
            <>
              {/* ADMIN FORM */}
              <div className="space-y-4">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="admin@company.com" 
                  required
                  className="w-full bg-black/40 text-white placeholder-white/40 p-4 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
                />
                <input 
                  type="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required
                  className="w-full bg-black/40 text-white placeholder-white/40 p-4 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
                />
              </div>
              <SubmitButton label="Unlock Dashboard" />
            </>
          ) : (
            <>
              {/* EMPLOYEE FORM */}
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                    <label className="block text-xs text-blue-200/70 uppercase tracking-widest mb-2">Surname</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      placeholder="e.g. Soronio" 
                      required
                      className="w-full bg-transparent text-white text-xl font-bold text-center placeholder-white/20 focus:outline-none border-b border-white/20 focus:border-blue-400 transition-colors pb-2"
                    />
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                    <label className="block text-xs text-blue-200/70 uppercase tracking-widest mb-2">6-Digit ID Code</label>
                    <input 
                      type="text" 
                      name="employeeId" 
                      placeholder="000 000" 
                      maxLength={6}
                      required
                      className="w-full bg-transparent text-white text-3xl font-mono font-bold text-center placeholder-white/20 focus:outline-none border-b border-white/20 focus:border-blue-400 transition-colors pb-2 tracking-[0.5em]"
                    />
                </div>
              </div>
              <SubmitButton label="Log In" />
            </>
          )}
        </form>
      </div>
    </main>
  );
}
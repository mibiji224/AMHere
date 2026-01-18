'use client' // 👈 Add this at the top so we can use Client components

import { loginEmployee } from './action';
import ThemeToggle from '../components/ThemeToggle'; 
import Link from 'next/link'; // 👈 Import the Next.js Link component

export default function EmployeeLoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 transition-colors duration-300">
      
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Employee Portal</h1>
          <p className="text-sm text-muted-foreground">Enter your surname and ID to view your schedule.</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border shadow-sm rounded-xl p-6 sm:p-8">
          <form action={loginEmployee} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Surname</label>
              <input 
                name="lastName" 
                type="text" 
                placeholder="e.g. Soronio" 
                required 
                className="w-full bg-background border border-input rounded-lg p-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">6-Digit ID Code</label>
              <input 
                name="employeeId" 
                type="password" 
                inputMode="numeric" 
                placeholder="000000" 
                required 
                className="w-full bg-background border border-input rounded-lg p-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-blue-500 transition tracking-widest text-center font-mono"
              />
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-sm transition active:scale-95">
              Access Portal
            </button>

          </form>
        </div>

        {/* 👇 FIX: Use Link component instead of <a> tag */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">Management Access Only</p>
          <Link 
            href="/admin/login" 
            className="inline-flex items-center justify-center text-xs font-bold text-primary hover:text-primary/80 border border-border px-6 py-2.5 rounded-full hover:bg-secondary transition"
          >
            Go to Admin Login →
          </Link>
        </div>

      </div>
    </div>
  );
}
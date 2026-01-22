// app/admin/login/page.tsx
'use client'

import { loginAdmin } from '@/app/login/action'; 
import ThemeToggle from '@/app/components/ThemeToggle'; 
import Link from 'next/link';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';

function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const { pending } = useFormStatus();

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await loginAdmin(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <>
      {error && (
        <div className="w-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">Login Failed</p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
          </div>
        </div>
      )}
      <form action={handleSubmit} className="space-y-4">
        
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
          <input 
            name="email" 
            type="email" 
            placeholder="admin@company.com" 
            required 
            disabled={pending}
            className="w-full bg-background border border-input rounded-lg p-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Password</label>
          <input 
            name="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            disabled={pending}
            className="w-full bg-background border border-input rounded-lg p-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <button 
          type="submit"
          disabled={pending}
          className="w-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-70 disabled:cursor-not-allowed font-bold py-3 rounded-lg shadow-sm transition active:scale-95"
        >
          {pending ? 'Logging in...' : 'Dashboard Login'}
        </button>

      </form>
    </>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 transition-colors duration-300">
      
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
          <p className="text-sm text-muted-foreground">Log in to manage schedules and requests.</p>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-xl p-6 sm:p-8">
          <AdminLoginForm />
        </div>

        <div className="text-center">
          <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition flex items-center justify-center gap-1">
            ← Back to Employee Portal
          </Link>
        </div>

      </div>
    </div>
  );
}
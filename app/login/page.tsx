'use client'

import { loginEmployee } from './actions';
import ThemeToggle from '../components/ThemeToggle';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function EmployeeLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await loginEmployee(formData);

      if (result.error) {
        setError(result.error);
        setIsPending(false);
      } else if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsPending(false);
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
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Surname</label>
          <input
            name="lastName"
            type="text"
            placeholder="e.g. Soronio"
            required
            disabled={isPending}
            className="w-full bg-background border border-input rounded-lg p-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
            disabled={isPending}
            className="w-full bg-background border border-input rounded-lg p-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-blue-500 transition tracking-widest text-center font-mono disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-sm transition active:scale-95"
        >
          {isPending ? 'Verifying...' : 'Access Portal'}
        </button>

      </form>
    </>
  );
}

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
          <EmployeeLoginForm />
        </div>

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

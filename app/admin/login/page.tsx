// app/admin/login/page.tsx
import { loginAdmin } from '@/app/login/action'; 
import ThemeToggle from '@/app/components/ThemeToggle'; 
import Link from 'next/link';

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
          <form action={loginAdmin} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
              <input 
                name="email" 
                type="email" 
                placeholder="admin@company.com" 
                required 
                className="w-full bg-background border border-input rounded-lg p-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Password</label>
              <input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="w-full bg-background border border-input rounded-lg p-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <button className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold py-3 rounded-lg shadow-sm transition active:scale-95">
              Dashboard Login
            </button>

          </form>
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
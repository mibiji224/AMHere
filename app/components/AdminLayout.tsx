'use client'

import { useState } from 'react';
import { useTheme } from './ThemeProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../login/action'; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/' || pathname.startsWith('/admin/employees/');
    return pathname.startsWith(path);
  };
  
  const linkStyle = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium text-sm
    ${isActive(path) 
      ? 'bg-primary text-primary-foreground shadow-md' 
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }
  `;

  return (
    <div className="min-h-screen bg-background flex transition-colors duration-300">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-background/80 border-b z-50 flex justify-between items-center px-4 h-16 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
             <span className="font-bold text-white">A</span>
          </div>
          <span className="font-bold text-lg text-foreground">AM-HERE</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-foreground">
            {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-72 bg-card border-r z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:flex-shrink-0
      `}>
        
        <div className="flex p-6 items-center gap-3 border-b flex-shrink-0">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <span className="font-bold text-lg block leading-none text-foreground">AM-HERE</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1 block">Admin Portal</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <Link href="/" className={linkStyle('/')} onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span>Employees</span>
          </Link>
          <Link href="/admin/schedule" className={linkStyle('/admin/schedule')} onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Schedules</span>
          </Link>
          <Link href="/admin/leaves" className={linkStyle('/admin/leaves')} onClick={() => setIsMobileMenuOpen(false)}>
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            <span>Leave Requests</span>
          </Link>
          <Link href="/admin/payroll" className={linkStyle('/admin/payroll')} onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Payroll</span>
          </Link>
        </nav>

        <div className="p-4 border-t bg-muted/20 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium text-muted-foreground">Dark Mode</span>
            <button onClick={toggleTheme} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>
          <form action={logout}>
             <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span>Sign Out</span>
             </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 w-full min-w-0 pt-16 lg:pt-0 overflow-y-auto h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>

    </div>
  );
}
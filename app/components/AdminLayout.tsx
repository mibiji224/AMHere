'use client'

import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

// Mock implementations for Next.js dependencies
const Link = ({ href, className, onClick, children }: any) => (
  <a href={href} className={className} onClick={onClick}>
    {children}
  </a>
);

const usePathname = () => {
  return typeof window !== 'undefined' ? window.location.pathname : '/';
};

const logout = async () => {
  console.log('Logout action called');
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname.startsWith('/admin/employees/');
    }
    return pathname.startsWith(path);
  };
  
  const linkStyle = (path: string) => `
    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group font-medium text-sm
    ${isActive(path) 
      ? 'bg-primary text-primary-foreground shadow-sm' 
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }
  `;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background flex">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-background border-b z-50 flex justify-between items-center px-4 h-14 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-sm">AM-HERE</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 sm:w-72 bg-card border-r z-50 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:flex-shrink-0 flex flex-col
      `}>
        
        {/* Sidebar Header */}
        <div className="flex p-6 items-center gap-3 border-b flex-shrink-0">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-base block leading-none">AM-HERE</span>
            <span className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider mt-0.5 block">Admin Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-2">
            Main Menu
          </div>

          <Link 
            href="/" 
            className={linkStyle('/')} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Employees</span>
          </Link>

          <Link 
            href="/admin/schedule" 
            className={linkStyle('/admin/schedule')} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Schedules</span>
          </Link>

          <Link 
            href="/admin/leaves" 
            className={linkStyle('/admin/leaves')} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Leave Requests</span>
          </Link>

          <Link 
            href="/admin/payroll" 
            className={linkStyle('/admin/payroll')} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Payroll</span>
          </Link>
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 py-3 border-t flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theme</span>
            <button
              onClick={toggleTheme}
              className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              style={{ backgroundColor: isDarkMode ? '#3b82f6' : '#e5e7eb' }}
            >
              <span
                className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full shadow-sm ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
              <span className="absolute left-1 top-1">
                {!isDarkMode && (
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <span className="absolute right-1 top-1">
                {isDarkMode && (
                  <svg className="w-4 h-4 text-slate-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t bg-muted/50 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 border flex items-center justify-center text-xs font-semibold">
              AD
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Administrator</p>
              <p className="text-xs text-muted-foreground truncate">admin@company.com</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full min-w-0 pt-14 lg:pt-0">
        <div className="h-full p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      {/* Global Styles for Theme */}
      <style jsx global>{`
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --primary: 221.2 83.2% 53.3%;
          --primary-foreground: 210 40% 98%;
          --muted: 210 40% 96.1%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 210 40% 96.1%;
          --accent-foreground: 222.2 47.4% 11.2%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          --border: 214.3 31.8% 91.4%;
        }

        .dark {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 4.9%;
          --card-foreground: 210 40% 98%;
          --primary: 217.2 91.2% 59.8%;
          --primary-foreground: 222.2 47.4% 11.2%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
          --accent: 217.2 32.6% 17.5%;
          --accent-foreground: 210 40% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
        }

        * {
          border-color: hsl(var(--border));
        }

        body {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }

        .bg-background {
          background-color: hsl(var(--background));
        }

        .bg-card {
          background-color: hsl(var(--card));
        }

        .bg-primary {
          background-color: hsl(var(--primary));
        }

        .bg-muted\/50 {
          background-color: hsl(var(--muted) / 0.5);
        }

        .bg-accent {
          background-color: hsl(var(--accent));
        }

        .bg-primary\/10 {
          background-color: hsl(var(--primary) / 0.1);
        }

        .bg-destructive\/10 {
          background-color: hsl(var(--destructive) / 0.1);
        }

        .bg-destructive\/20 {
          background-color: hsl(var(--destructive) / 0.2);
        }

        .text-primary-foreground {
          color: hsl(var(--primary-foreground));
        }

        .text-muted-foreground {
          color: hsl(var(--muted-foreground));
        }

        .text-accent-foreground {
          color: hsl(var(--accent-foreground));
        }

        .text-destructive {
          color: hsl(var(--destructive));
        }

        .border {
          border-color: hsl(var(--border));
        }

        .border-destructive\/20 {
          border-color: hsl(var(--destructive) / 0.2);
        }

        .hover\:bg-accent:hover {
          background-color: hsl(var(--accent));
        }

        .hover\:text-accent-foreground:hover {
          color: hsl(var(--accent-foreground));
        }

        .hover\:bg-destructive\/20:hover {
          background-color: hsl(var(--destructive) / 0.2);
        }
      `}</style>
    </div>
  );
}
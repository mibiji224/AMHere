'use client';

import { 
  Clock, 
  User, 
  FileText, 
  Calendar, 
  LogOut, 
  LayoutDashboard,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/app/login/action';
import ThemeToggle from './ThemeToggle';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = [
    { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portal/records', label: 'My Records', icon: Clock },
    { href: '/portal/requests', label: 'Requests', icon: Calendar },
    { href: '/portal/payslips', label: 'Payslips', icon: FileText },
    { href: '/portal/profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 h-full flex flex-col">
          <div className="mb-8 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black">AM</span>
            </div>
            <span className="font-black text-xl tracking-tight">Here</span>
          </div>

          <nav className="space-y-1 flex-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <button 
              onClick={() => logout()} 
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* MOBILE HEADER */}
        <header className="md:hidden h-16 border-b border-border flex items-center justify-between px-4 bg-card">
          <span className="font-bold">Employee Portal</span>
          <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2">
            <Menu />
          </button>
        </header>

        <div className="p-4 lg:p-8 max-w-5xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>

      {/* OVERLAY */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
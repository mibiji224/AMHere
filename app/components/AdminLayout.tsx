'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../login/action';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', href: '/' },
        { name: 'Employees & History', href: '/admin/employees' },
        { name: 'Schedules', href: '/admin/schedules' },
        { name: 'Leave Requests', href: '/admin/leaves' },
        { name: 'Payroll Reports', href: '/admin/reports' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* 1. Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full shadow-xl z-50 hidden md:block">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold tracking-tight">AM-HERE <span className="text-blue-500">HR</span></h1>
                    <p className="text-slate-400 text-xs mt-1">Admin Workspace</p>
                </div>

                <nav className="space-y-1">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <span>👥</span>
                        <span className="font-medium">Employees & History</span>
                    </Link>

                    <Link
                        href="/admin/schedule"
                        className="flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <span>Hz</span> {/* Hz icon or Calendar icon */}
                        <span className="font-medium">Schedules</span>
                    </Link>

                    <Link
                        href="/admin/leaves"
                        className="flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <span>✈️</span>
                        <span className="font-medium">Leave Requests</span>
                    </Link>

                    <Link
                        href="/admin/payroll"
                        className="flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <span>💰</span>
                        <span className="font-medium">Payroll Reports</span>
                    </Link>
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                    <form action={logout}>
                        <button className="w-full flex items-center justify-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-lg transition">
                            <span>Sign Out</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* 2. Main Content Area */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

                {/* Navbar */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
                    <h2 className="font-semibold text-gray-700 capitalize">
                        {menuItems.find(i => i.href === pathname)?.name || 'Admin'}
                    </h2>

                    <div className="flex items-center gap-4">
                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            System Online
                        </div>

                        {/* Admin Profile */}
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
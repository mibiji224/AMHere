'use client'

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <button 
      onClick={toggleTheme} 
      className={`
        relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
        ${isDarkMode ? 'bg-slate-700' : 'bg-blue-100'}
      `}
      aria-label="Toggle Theme"
    >
      <span className="sr-only">Toggle Theme</span>
      
      {/* The Moving Circle */}
      <span 
        className={`
          inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 relative
          ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}
        `}
      >
        {/* 👇 FIX: Absolutely center the SVGs within the circle */}
        {isDarkMode ? (
          // Moon Icon (Dark Mode)
          <svg className="w-4 h-4 text-slate-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          // Sun Icon (Light Mode)
          <svg className="w-4 h-4 text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </span>
    </button>
  );
}
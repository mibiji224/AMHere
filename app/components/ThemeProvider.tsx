'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// 👇 ADD 'storageKey' to the props
export function ThemeProvider({ 
  children, 
  storageKey = 'theme' // Default key if none provided
}: { 
  children: ReactNode, 
  storageKey?: string 
}) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    
    // 1. Load from the SPECIFIC storage key
    const savedTheme = (localStorage.getItem(storageKey) as Theme) || 'light'
    setTheme(savedTheme)
    setMounted(true)

    // 2. Apply the theme
    if (savedTheme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }, [storageKey]) // Re-run if key changes

  const toggleTheme = () => {
    const root = window.document.documentElement
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    
    setTheme(newTheme)
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
    
    // 3. Save to the SPECIFIC storage key
    localStorage.setItem(storageKey, newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
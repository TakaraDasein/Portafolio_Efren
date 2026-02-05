'use client'

import * as React from 'react'

export interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  enableTransitionOnChange?: boolean
  storageKey?: string
  themes?: string[]
  theme?: string
  onThemeChange?: (theme: string) => void
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  storageKey = 'theme',
  themes = ['light', 'dark'],
  theme: controlledTheme,
  onThemeChange,
  enableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<string | undefined>(controlledTheme ?? defaultTheme)

  // Initialize theme on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(storageKey) || undefined
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      
      const initialTheme = stored || (enableSystem ? systemTheme : defaultTheme)
      setTheme(initialTheme)
      applyTheme(initialTheme)
    } catch (e) {
      console.error('Failed to load theme:', e)
    }
  }, [defaultTheme, enableSystem, storageKey])

  // Update theme when controlled theme changes
  React.useEffect(() => {
    if (controlledTheme) {
      setTheme(controlledTheme)
      applyTheme(controlledTheme)
    }
  }, [controlledTheme])

  const applyTheme = (newTheme: string) => {
    if (enableTransitionOnChange) {
      document.documentElement.style.transition = 'background-color 0.3s, color 0.3s'
    }
    
    document.documentElement.setAttribute('data-theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    
    if (enableTransitionOnChange) {
      setTimeout(() => {
        document.documentElement.style.transition = ''
      }, 300)
    }
  }

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme)
    applyTheme(newTheme)
    try {
      localStorage.setItem(storageKey, newTheme)
    } catch (e) {
      console.error('Failed to save theme:', e)
    }
    onThemeChange?.(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

const ThemeContext = React.createContext<{
  theme?: string
  setTheme: (theme: string) => void
  themes: string[]
} | undefined>(undefined)

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}


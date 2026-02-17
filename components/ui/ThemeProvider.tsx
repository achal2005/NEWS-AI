'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'paper' | 'dark' | 'sepia'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('paper')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const stored = localStorage.getItem('news-theme') as Theme | null
        if (stored && ['paper', 'dark', 'sepia'].includes(stored)) {
            setTheme(stored)
            document.documentElement.setAttribute('data-theme', stored)
        }
    }, [])

    const handleSetTheme = (newTheme: Theme) => {
        setTheme(newTheme)
        localStorage.setItem('news-theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    // Prevent flash of wrong theme
    if (!mounted) {
        return (
            <ThemeContext.Provider value={{ theme: 'paper', setTheme: handleSetTheme }}>
                {children}
            </ThemeContext.Provider>
        )
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
            {children}
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

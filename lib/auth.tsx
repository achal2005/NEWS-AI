'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    email: string
    display_name: string | null
    avatar_url: string | null
    profile_complete: boolean
    age?: number
    total_reading_time_seconds?: number
    articles_read_count?: number
    created_at?: string
    taste_profile?: {
        preferred_categories: string[]
        summary_mode: string
        reading_level: number
        topic_weights: Record<string, number>
    } | null
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (code: string) => Promise<{ profileComplete: boolean }>
    logout: () => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Set a lightweight cookie for edge middleware auth checks only.
 * This cookie contains ONLY a flag, NOT the actual JWT token.
 * The real JWT lives in the HttpOnly cookie set by the backend.
 */
function setAuthFlagCookie() {
    document.cookie = `token=authenticated; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

/** Clear the auth flag cookie. */
function clearAuthFlagCookie() {
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
}

/** Check if the auth flag cookie exists. */
function hasAuthFlagCookie(): boolean {
    if (typeof document === 'undefined') return false
    return document.cookie.includes('token=authenticated')
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const fetchUser = useCallback(async () => {
        try {
            // FIX #2: Use credentials: 'include' so the HttpOnly cookie is sent
            // No Bearer header needed — backend reads JWT from cookie
            const res = await fetch(`${API_URL}/api/auth/me`, {
                credentials: 'include',
            })

            if (res.ok) {
                const userData = await res.json()
                setUser(userData)
                setAuthFlagCookie()
            } else {
                // Token invalid or expired — clear state
                setUser(null)
                clearAuthFlagCookie()
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        // On mount, try to fetch user using HttpOnly cookie
        if (hasAuthFlagCookie()) {
            fetchUser()
        } else {
            setIsLoading(false)
        }
    }, [fetchUser])

    const login = async (code: string): Promise<{ profileComplete: boolean }> => {
        const res = await fetch(`${API_URL}/api/auth/google/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',  // Receive HttpOnly cookie from backend
            body: JSON.stringify({ code })
        })

        if (!res.ok) {
            throw new Error('Login failed')
        }

        const data = await res.json()

        // FIX #2: Do NOT store the JWT in localStorage or JS-accessible cookie.
        // The backend already set an HttpOnly cookie. We only set a flag for middleware.
        setAuthFlagCookie()

        await fetchUser()

        return { profileComplete: data.profile_complete ?? false }
    }

    const logout = async () => {
        // R20: Synchronous cleanup order — clear state first, then backend, then redirect
        clearAuthFlagCookie()
        setUser(null)

        // Call backend to clear HttpOnly cookie
        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            })
        } catch {}

        // R20: Use replace to force middleware re-evaluation (prevents back-button issues)
        router.replace('/')
    }

    const refreshUser = async () => {
        await fetchUser()
    }

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            logout,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
    Component: React.ComponentType<P>
): React.FC<P> {
    return function ProtectedRoute(props: P) {
        const { isAuthenticated, isLoading } = useAuth()
        const router = useRouter()

        useEffect(() => {
            if (!isLoading && !isAuthenticated) {
                router.push('/login')
            }
        }, [isLoading, isAuthenticated, router])

        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-canvas">
                    <div className="w-12 h-12 border-3 border-ink border-t-primary animate-spin" />
                </div>
            )
        }

        if (!isAuthenticated) {
            return null
        }

        return <Component {...props} />
    }
}

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

/**
 * FIX 3: Removed ALL JS-accessible cookie manipulation.
 * Token now lives only in HttpOnly cookie set by the backend.
 * Auth state is derived from /api/auth/me response.
 * All API calls use credentials: 'include' instead of Authorization headers.
 */

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const fetchUser = useCallback(async () => {
        try {
            // FIX 3: Use credentials: 'include' — the HttpOnly cookie is sent automatically
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                credentials: 'include',
            })

            if (res.ok) {
                const userData = await res.json()
                setUser(userData)
            } else {
                // Cookie invalid or expired — clear user state
                setUser(null)
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        // FIX 3: On mount, check auth status via /api/auth/me
        // The HttpOnly cookie will be sent automatically by the browser
        fetchUser()
    }, [fetchUser])

    const login = async (code: string): Promise<{ profileComplete: boolean }> => {
        // FIX 3: Use credentials: 'include' to receive the HttpOnly cookie
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',  // FIX 3: receive the HttpOnly cookie
            body: JSON.stringify({ code })
        })

        if (!res.ok) {
            throw new Error('Login failed')
        }

        const data = await res.json()

        // FIX 3: No JS token storage — fetch user from /me to populate state
        await fetchUser()

        return { profileComplete: data.profile_complete ?? false }
    }

    const logout = async () => {
        // Call backend to clear the HttpOnly cookie
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            })
        } catch (e) {
            // Continue logout even if backend call fails
        }
        // FIX 3: No JS cookie to clear — just reset state
        setUser(null)
        router.push('/')
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
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            )
        }

        if (!isAuthenticated) {
            return null
        }

        return <Component {...props} />
    }
}

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
    token: string | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (code: string) => Promise<{ profileComplete: boolean }>
    logout: () => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/** Set a cookie (used by edge middleware to check auth). */
function setTokenCookie(token: string) {
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

/** Clear the token cookie. */
function clearTokenCookie() {
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
}

/** Read the token from the cookie. */
function getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const fetchUser = useCallback(async (authToken: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })

            if (res.ok) {
                const userData = await res.json()
                setUser(userData)
            } else {
                // Token invalid or expired — clear user state
                setUser(null)
                setToken(null)
                clearTokenCookie()
                localStorage.removeItem('token')
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
            setUser(null)
            setToken(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        // On mount, check for token in localStorage (or cookie)
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const cookieToken = getTokenFromCookie()
        const activeToken = storedToken || cookieToken

        if (activeToken) {
            setToken(activeToken)
            // Ensure both storages have it
            if (!storedToken) localStorage.setItem('token', activeToken)
            if (!cookieToken) setTokenCookie(activeToken)
            
            fetchUser(activeToken)
        } else {
            setIsLoading(false)
        }
    }, [fetchUser])

    const login = async (code: string): Promise<{ profileComplete: boolean }> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        })

        if (!res.ok) {
            throw new Error('Login failed')
        }

        const data = await res.json()
        const authToken = data.access_token

        // Store the token
        localStorage.setItem('token', authToken)
        setTokenCookie(authToken)
        setToken(authToken)

        await fetchUser(authToken)

        return { profileComplete: data.profile_complete ?? false }
    }

    const logout = async () => {
        // We only clear client-side state now, since backend relies on Authorization header
        clearTokenCookie()
        localStorage.removeItem('token')
        setUser(null)
        setToken(null)
        router.push('/')
    }

    const refreshUser = async () => {
        if (token) {
            await fetchUser(token)
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
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

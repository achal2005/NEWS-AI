'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check for stored token on mount
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
            setToken(storedToken)
            // Ensure cookie is also set (in case it was cleared)
            setTokenCookie(storedToken)
            fetchUser(storedToken)
        } else {
            setIsLoading(false)
        }
    }, [])

    const fetchUser = async (authToken: string) => {
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
                // Token invalid, clear it
                localStorage.removeItem('token')
                clearTokenCookie()
                setToken(null)
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
        } finally {
            setIsLoading(false)
        }
    }

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

        localStorage.setItem('token', authToken)
        setTokenCookie(authToken)
        setToken(authToken)

        await fetchUser(authToken)

        // Redirect to onboarding if profile is not complete
        if (!data.profile_complete) {
            router.push('/onboarding')
        }

        return { profileComplete: data.profile_complete }
    }

    const logout = () => {
        localStorage.removeItem('token')
        clearTokenCookie()
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


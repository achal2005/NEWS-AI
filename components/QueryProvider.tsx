'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000,      // 5 min — news doesn't change every second
                        gcTime: 30 * 60 * 1000,         // 30 min cache
                        refetchOnWindowFocus: false,
                        retry: 2,
                        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

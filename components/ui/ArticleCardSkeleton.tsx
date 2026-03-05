'use client'

export function ArticleCardSkeleton({ size = 'normal' }: { size?: 'normal' | 'featured' | 'tall' | 'wide' }) {
    const showImage = size === 'featured' || size === 'tall' || size === 'wide'

    return (
        <div className={`brutal-card border-3 border-ink/20 flex flex-col justify-between h-full overflow-hidden bg-white`}>
            {/* Image skeleton */}
            {showImage && (
                <div className={`${size === 'featured' ? 'h-[240px]' : size === 'wide' ? 'h-[180px]' : 'h-[160px]'} w-full border-b-3 border-ink/20 overflow-hidden`}>
                    <div className="w-full h-full bg-gray-200 skeleton-pulse" />
                </div>
            )}

            <div className="flex-1 p-5">
                {/* Category + Source badges */}
                <div className="flex gap-2 mb-3">
                    <div className="h-5 w-20 bg-gray-200 skeleton-pulse" />
                    <div className="h-5 w-16 bg-gray-200 skeleton-pulse" />
                </div>

                {/* Title lines */}
                <div className="space-y-2 mb-3">
                    <div className={`h-5 bg-gray-200 skeleton-pulse ${size === 'featured' ? 'w-full' : 'w-4/5'}`} />
                    <div className={`h-5 bg-gray-200 skeleton-pulse ${size === 'featured' ? 'w-3/4' : 'w-3/5'}`} />
                    {size === 'featured' && <div className="h-5 w-1/2 bg-gray-200 skeleton-pulse" />}
                </div>

                {/* Excerpt for featured/wide */}
                {(size === 'featured' || size === 'wide') && (
                    <div className="space-y-1.5">
                        <div className="h-3 w-full bg-gray-100 skeleton-pulse" />
                        <div className="h-3 w-2/3 bg-gray-100 skeleton-pulse" />
                    </div>
                )}
            </div>

            {/* Footer: date + arrow */}
            <div className="px-5 pb-4 mt-auto flex justify-between items-end">
                <div className="h-3 w-24 bg-gray-200 skeleton-pulse" />
                <div className="size-8 rounded-full bg-gray-200 skeleton-pulse" />
            </div>
        </div>
    )
}

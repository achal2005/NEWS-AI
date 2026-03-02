'use client'

// Newspaper-style skeleton loader matching the article grid layout
const SKELETON_PATTERN = [
    'col-span-1 md:col-span-2 row-span-2',   // Featured
    'col-span-1 row-span-1',                  // Normal
    'col-span-1 row-span-2',                  // Tall
    'col-span-1 md:col-span-2 row-span-1',    // Wide
    'col-span-1 row-span-1',                  // Normal
    'col-span-1 row-span-1',                  // Normal
    'col-span-1 row-span-2',                  // Tall
    'col-span-1 row-span-1',                  // Normal
]

function SkeletonCard({ spanClass, index }: { spanClass: string; index: number }) {
    const isBig = spanClass.includes('col-span-2') || spanClass.includes('row-span-2')

    return (
        <div
            className={`bg-white border-3 border-ink shadow-hard flex flex-col overflow-hidden ${spanClass}`}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Image placeholder for bigger cards */}
            {isBig && (
                <div className="h-[160px] bg-paper-grey border-b-3 border-ink relative overflow-hidden">
                    <div className="absolute inset-0 skeleton-shimmer" />
                </div>
            )}

            <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-3">
                    {/* Category tag */}
                    <div className="flex gap-2">
                        <div className="h-5 w-16 bg-ink relative overflow-hidden">
                            <div className="absolute inset-0 skeleton-shimmer" />
                        </div>
                        <div className="h-5 w-20 border-2 border-ink/20 relative overflow-hidden">
                            <div className="absolute inset-0 skeleton-shimmer" />
                        </div>
                    </div>

                    {/* Title lines */}
                    <div className="space-y-2">
                        <div className="h-6 bg-paper-grey w-full relative overflow-hidden">
                            <div className="absolute inset-0 skeleton-shimmer" />
                        </div>
                        <div className="h-6 bg-paper-grey w-4/5 relative overflow-hidden">
                            <div className="absolute inset-0 skeleton-shimmer" />
                        </div>
                        {isBig && (
                            <div className="h-6 bg-paper-grey w-3/5 relative overflow-hidden">
                                <div className="absolute inset-0 skeleton-shimmer" />
                            </div>
                        )}
                    </div>

                    {/* Content placeholder for big cards */}
                    {isBig && (
                        <div className="space-y-2 mt-2">
                            <div className="h-4 bg-paper-accent w-full relative overflow-hidden">
                                <div className="absolute inset-0 skeleton-shimmer" />
                            </div>
                            <div className="h-4 bg-paper-accent w-2/3 relative overflow-hidden">
                                <div className="absolute inset-0 skeleton-shimmer" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Date + arrow */}
                <div className="flex justify-between items-center mt-auto">
                    <div className="h-3 bg-paper-accent w-20 relative overflow-hidden">
                        <div className="absolute inset-0 skeleton-shimmer" />
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-ink/20 relative overflow-hidden">
                        <div className="absolute inset-0 skeleton-shimmer" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function NewspaperLoader() {
    return (
        <div className="flex-1 p-8 pt-2">
            {/* Header skeleton */}
            <header className="py-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
                <div className="flex flex-col gap-3">
                    <div className="h-6 w-48 bg-ink relative overflow-hidden">
                        <div className="absolute inset-0 skeleton-shimmer" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-12 w-64 bg-paper-grey relative overflow-hidden">
                            <div className="absolute inset-0 skeleton-shimmer" />
                        </div>
                    </div>
                </div>
                <div className="h-10 w-32 bg-white border-3 border-ink shadow-hard relative overflow-hidden">
                    <div className="absolute inset-0 skeleton-shimmer" />
                </div>
            </header>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-[minmax(180px,auto)] grid-flow-dense pb-12 max-w-[1400px] mx-auto">
                {SKELETON_PATTERN.map((spanClass, i) => (
                    <SkeletonCard key={i} spanClass={spanClass} index={i} />
                ))}
            </div>
        </div>
    )
}

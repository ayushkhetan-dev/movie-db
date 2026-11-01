export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-fg/10 ${className}`} aria-hidden="true" />;
}

export function RailSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden px-4 sm:px-8" role="status" aria-label="Loading movies">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="w-40 shrink-0 sm:w-44">
          <Skeleton className="aspect-[2/3] w-full" />
          <Skeleton className="mt-3 h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[2/3] w-full" />
          <Skeleton className="mt-3 h-4 w-3/4" />
        </div>
      ))}
    </>
  );
}

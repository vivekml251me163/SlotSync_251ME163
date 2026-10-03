import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 bg-muted/50" />
          <Skeleton className="h-4 w-64 bg-muted/30" />
        </div>
        <Skeleton className="h-9 w-56 bg-muted/40 rounded-xl" />
      </div>

      {/* 6 stat card skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl bg-muted/40" />
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-[308px] w-full rounded-xl bg-muted/40" />
        <Skeleton className="h-[308px] w-full rounded-xl bg-muted/40" />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-[296px] w-full rounded-xl bg-muted/40" />
        <div className="space-y-4">
          <Skeleton className="h-[180px] w-full rounded-xl bg-muted/40" />
          <Skeleton className="h-[108px] w-full rounded-xl bg-muted/40" />
        </div>
      </div>
    </div>
  );
}

import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
      {...props}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading dashboard">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64 max-w-full" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
        <Skeleton className="h-12 w-full md:w-40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Skeleton className="h-36 rounded-none" />
        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 bg-white p-6">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28 max-w-full" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 p-6 sm:flex-row">
          <Skeleton className="h-12 w-full sm:w-40" />
          <Skeleton className="h-12 w-full sm:w-32" />
          <Skeleton className="h-12 w-full sm:w-36" />
        </div>
      </div>
    </div>
  );
}

export function SavedTripsSkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading saved trips">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-56 max-w-full" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
        <Skeleton className="h-12 w-full sm:w-40" />
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-48 max-w-full" />
              </div>
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
            <div className="mt-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
            <div className="mt-6 flex gap-3">
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-11 flex-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TripDetailsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading trip details">
      <Skeleton className="h-5 w-40" />
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 p-6 md:p-8">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-96 max-w-full" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-36 rounded-full" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-2 h-7 w-48" />
        <div className="mt-7 grid gap-4 md:grid-cols-[1fr_auto_1fr]">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="mx-auto h-8 w-8 rounded-full" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-3 p-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-72 max-w-full" />
        </div>
        <Skeleton className="h-[320px] w-full rounded-none sm:h-[380px] lg:h-[420px]" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-7 w-40 max-w-full" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;

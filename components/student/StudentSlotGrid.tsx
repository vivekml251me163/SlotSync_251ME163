"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Clock } from "lucide-react";

interface SlotItem {
  slotStart: string;
  slotEnd: string;
  status: "available" | "booked" | "pending";
  isUserBooking?: boolean;
  userBookingStatus?: string;
}

interface StudentSlotGridProps {
  facilityId: string;
  date: string;
}

function formatHourLabel(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return "";
  }
}

function formatSlotTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return "";
  }
}

function formatSlotRange(start: string, end: string): string {
  return `${formatSlotTime(start)} – ${formatSlotTime(end)}`;
}

export function StudentSlotGrid({ facilityId, date }: StudentSlotGridProps) {
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAvailability = useCallback(
    async (initial: boolean) => {
      if (!facilityId || !date) return;

      if (initial) {
        setIsLoading(true);
      } else {
        // Fade out, then refetch
        setIsFading(true);
        await new Promise((r) => setTimeout(r, 150));
      }

      setErrorMsg(null);

      try {
        const res = await fetch(
          `/api/availability?facilityId=${encodeURIComponent(facilityId)}&date=${encodeURIComponent(date)}`
        );
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || "Failed to load slot availability.");
          setSlots([]);
        } else {
          setSlots(data.slots || []);
        }
      } catch {
        setErrorMsg("An error occurred while fetching availability.");
      } finally {
        setIsLoading(false);
        setIsFading(false);
      }
    },
    [facilityId, date]
  );

  useEffect(() => {
    fetchAvailability(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // On date/facility change (after mount) — fade transition
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!mounted) { setMounted(true); return; }
    fetchAvailability(false);
  }, [facilityId, date]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3">
      {/* Read-only notice */}
      <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground">
        <Eye className="w-4 h-4 shrink-0" />
        <span>You are viewing in read-only mode. Students cannot make bookings.</span>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Subtle refetch indicator */}
      {isFading && !isLoading && (
        <p className="text-xs text-muted-foreground animate-pulse px-1">Updating…</p>
      )}

      {/* Grid container */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <ScrollArea className="h-[500px] pr-3">
          {isLoading ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[64px_1fr] items-center h-16">
                  <Skeleton className="h-4 w-10 bg-muted/40" />
                  <Skeleton className="h-14 w-full rounded-lg bg-muted/40 mx-1" />
                </div>
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Clock className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
              <p className="text-sm font-medium text-foreground">No slots available</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Check facility operating hours or select another date.
              </p>
            </div>
          ) : (
            <div
              className="space-y-2 py-2 transition-opacity duration-150"
              style={{ opacity: isFading ? 0 : 1 }}
            >
              {slots.map((slot, idx) => {
                const hourLabel = formatHourLabel(slot.slotStart);
                const timeRange = formatSlotRange(slot.slotStart, slot.slotEnd);

                const isAvailable = slot.status === "available";
                const isBooked = slot.status === "booked";
                const isPending = slot.status === "pending";

                return (
                  <div
                    key={idx}
                    className="grid grid-cols-[64px_1fr] items-center min-h-[64px]"
                  >
                    {/* Time axis */}
                    <div className="h-16 flex items-start pt-1 text-xs text-muted-foreground font-mono pr-3 text-right shrink-0">
                      {hourLabel}
                    </div>

                    {/* Slot cell */}
                    <div className="h-14 flex-1">
                      {isAvailable ? (
                        <div className="h-full rounded-lg mx-1 p-2 bg-green-500/10 border border-green-500/20 flex flex-col justify-between cursor-default">
                          <span className="text-xs font-medium text-green-400">Available</span>
                          <span className="text-[11px] font-mono text-muted-foreground">{timeRange}</span>
                        </div>
                      ) : isBooked ? (
                        <div className="h-full rounded-lg mx-1 p-2 bg-rose-500/10 border border-rose-500/20 flex flex-col justify-between cursor-default">
                          <span className="text-xs font-semibold text-rose-400">Booked</span>
                          <span className="text-[11px] font-mono text-muted-foreground">{timeRange}</span>
                        </div>
                      ) : isPending ? (
                        <div className="h-full rounded-lg mx-1 p-2 bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between cursor-default">
                          <span className="text-xs font-semibold text-amber-400">Pending</span>
                          <span className="text-[11px] font-mono text-muted-foreground">{timeRange}</span>
                        </div>
                      ) : (
                        <div className="h-full rounded-lg mx-1 bg-muted/20 flex items-center justify-center cursor-not-allowed">
                          <span className="text-xs text-muted-foreground/40 font-mono">–</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mt-1 px-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/30 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/30 inline-block" />
          Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-yellow-500/20 border border-yellow-500/30 inline-block" />
          Pending
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-muted/40 border border-border inline-block" />
          Unavailable
        </span>
      </div>
    </div>
  );
}

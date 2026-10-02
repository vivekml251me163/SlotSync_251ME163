"use client";

import { useState, useEffect, useCallback } from "react";
import { Facility } from "@/lib/db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { BookSlotDialog } from "./BookSlotDialog";
import { JoinWaitlistDialog } from "./JoinWaitlistDialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertTriangle, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface SlotItem {
  slotStart: string;
  slotEnd: string;
  status: "available" | "booked" | "pending";
  isUserBooking?: boolean;
  userBookingStatus?: string;
}

interface SlotGridProps {
  facilityId: string;
  selectedDate: string;
  facility?: Facility | null;
  isStudent?: boolean;
}

function formatHourLabel(isoString: string): string {
  try {
    const d = new Date(isoString);
    let hour = d.getUTCHours();
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour} ${ampm}`;
  } catch {
    return isoString;
  }
}

function formatSlotTimeRange(startIso: string, endIso: string): string {
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    const sTime = s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
    const eTime = e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
    return `${sTime} - ${eTime}`;
  } catch {
    return "";
  }
}

export function SlotGrid({
  facilityId,
  selectedDate,
  facility,
  isStudent = false,
}: SlotGridProps) {
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [userBookingToday, setUserBookingToday] = useState(false);
  const [facilityStatus, setFacilityStatus] = useState<string>("AVAILABLE");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dialog states
  const [bookingSlot, setBookingSlot] = useState<SlotItem | null>(null);
  const [waitlistSlot, setWaitlistSlot] = useState<SlotItem | null>(null);

  const fetchAvailability = useCallback(async (isInitial = false) => {
    if (!facilityId || !selectedDate) return;

    if (isInitial) setIsLoading(true);
    else setIsRefetching(true);

    setErrorMsg(null);

    try {
      const res = await fetch(
        `/api/availability?facilityId=${encodeURIComponent(facilityId)}&date=${encodeURIComponent(selectedDate)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to load slot availability.");
        setSlots([]);
      } else {
        setSlots(data.slots || []);
        setUserBookingToday(!!data.userBookingToday);
        setFacilityStatus(data.facilityStatus || "AVAILABLE");
      }
    } catch {
      setErrorMsg("An error occurred while fetching slot availability.");
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [facilityId, selectedDate]);

  useEffect(() => {
    fetchAvailability(true);
  }, [fetchAvailability]);

  const handleAvailableSlotClick = (slot: SlotItem) => {
    if (isStudent || userBookingToday || facilityStatus !== "AVAILABLE") return;
    setBookingSlot(slot);
  };

  const handleJoinWaitlistClick = (e: React.MouseEvent, slot: SlotItem) => {
    e.stopPropagation();
    if (isStudent || userBookingToday) return;
    setWaitlistSlot(slot);
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {toastMsg && (
        <div
          className={`flex items-center justify-between rounded-lg p-3 text-sm font-medium ${
            toastMsg.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          <span className="flex items-center gap-2">
            {toastMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {toastMsg.text}
          </span>
          <button
            onClick={() => setToastMsg(null)}
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* User Booking Today Banner */}
      {userBookingToday && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2.5 text-sm text-yellow-400 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>You have already used your booking slot for today.</span>
        </div>
      )}

      {/* Facility Unavailable / Maintenance Banner */}
      {facilityStatus !== "AVAILABLE" && (
        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm text-purple-300 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            This facility is currently {facilityStatus.replace("_", " ").toLowerCase()}. Slot booking is disabled.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Calendar Grid Container */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm relative">
        {/* Refetch Overlay */}
        {isRefetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl pointer-events-none">
            <span className="text-xs font-semibold text-primary bg-card border border-border px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 animate-spin" /> Updating availability...
            </span>
          </div>
        )}

        <ScrollArea className="h-[600px] pr-3">
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
              <Clock className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">No slots available</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Check facility operating hours or select another date.
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              {slots.map((slot, index) => {
                const hourLabel = formatHourLabel(slot.slotStart);
                const timeRange = formatSlotTimeRange(slot.slotStart, slot.slotEnd);

                const isAvailable = slot.status === "available";
                const isBooked = slot.status === "booked";
                const isPending = slot.status === "pending";
                const isUserBooking = slot.isUserBooking;

                return (
                  <div
                    key={index}
                    className="grid grid-cols-[64px_1fr] items-center min-h-[64px]"
                  >
                    {/* Time Axis */}
                    <div className="h-16 flex items-start pt-1 text-xs text-muted-foreground font-mono pr-3 text-right shrink-0">
                      {hourLabel}
                    </div>

                    {/* Slot Cell */}
                    <div className="h-14 flex-1">
                      {isUserBooking ? (
                        /* User's Own Booking */
                        <div className="h-full rounded-lg mx-1 p-2 bg-primary/15 border border-primary/30 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-primary block">
                              Your Booking
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {timeRange}
                            </span>
                          </div>
                          {slot.userBookingStatus && (
                            <StatusBadge status={slot.userBookingStatus} />
                          )}
                        </div>
                      ) : isAvailable ? (
                        /* Available Slot */
                        <button
                          disabled={
                            userBookingToday || isStudent || facilityStatus !== "AVAILABLE"
                          }
                          onClick={() => handleAvailableSlotClick(slot)}
                          className="h-full w-full rounded-lg mx-1 p-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-left transition-all flex flex-col justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-xs font-semibold text-emerald-400">
                            Available
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground group-hover:text-foreground">
                            {timeRange}
                          </span>
                        </button>
                      ) : isBooked ? (
                        /* Booked Slot */
                        <div className="h-full rounded-lg mx-1 p-2 bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-rose-400 block">
                              Booked
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {timeRange}
                            </span>
                          </div>
                          {!isStudent && !userBookingToday && (
                            <button
                              onClick={(e) => handleJoinWaitlistClick(e, slot)}
                              className="text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/90 transition-colors"
                            >
                              Join Waitlist
                            </button>
                          )}
                        </div>
                      ) : isPending ? (
                        /* Pending Slot */
                        <div className="h-full rounded-lg mx-1 p-2 bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
                          <span className="text-xs font-semibold text-amber-400">
                            Pending approval
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {timeRange}
                          </span>
                        </div>
                      ) : (
                        /* Outside Hours */
                        <div className="h-full rounded-lg mx-1 bg-muted/20 flex items-center justify-center cursor-not-allowed">
                          <span className="text-xs text-muted-foreground/40 font-mono">&ndash;</span>
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

      {/* Book Slot Dialog */}
      {bookingSlot && facility && (
        <BookSlotDialog
          open={!!bookingSlot}
          onOpenChange={(open) => !open && setBookingSlot(null)}
          facilityId={facility.id}
          facilityName={facility.name}
          facilityLocation={facility.location}
          facilityType={facility.type}
          selectedDate={selectedDate}
          slotStart={bookingSlot.slotStart}
          slotEnd={bookingSlot.slotEnd}
          onSuccess={() => fetchAvailability(false)}
          onToast={(text) => setToastMsg({ type: "success", text })}
        />
      )}

      {/* Join Waitlist Dialog */}
      {waitlistSlot && facility && (
        <JoinWaitlistDialog
          open={!!waitlistSlot}
          onOpenChange={(open) => !open && setWaitlistSlot(null)}
          facilityId={facility.id}
          facilityName={facility.name}
          facilityLocation={facility.location}
          selectedDate={selectedDate}
          slotStart={waitlistSlot.slotStart}
          slotEnd={waitlistSlot.slotEnd}
          onSuccess={() => fetchAvailability(false)}
          onToast={(text) => setToastMsg({ type: "success", text })}
        />
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface Slot {
  slotStart: string;
  slotEnd: string;
  status: "available" | "booked" | "pending";
}

interface SlotGridProps {
  facilityId: string;
  selectedDate: string;
  facilityName?: string;
  isStudent?: boolean;
}

export function SlotGrid({
  facilityId,
  selectedDate,
  facilityName = "Selected Facility",
  isStudent = false,
}: SlotGridProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [userBookingToday, setUserBookingToday] = useState(false);
  const [facilityStatus, setFacilityStatus] = useState<string>("AVAILABLE");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAvailability = useCallback(async () => {
    if (!facilityId || !selectedDate) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(
        `/api/availability?facilityId=${encodeURIComponent(facilityId)}&date=${encodeURIComponent(selectedDate)}`
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to load availability.");
        setSlots([]);
      } else {
        setSlots(data.slots || []);
        setUserBookingToday(!!data.userBookingToday);
        setFacilityStatus(data.facilityStatus || "AVAILABLE");
      }
    } catch {
      setErrorMsg("An error occurred while fetching availability.");
    } finally {
      setIsLoading(false);
    }
  }, [facilityId, selectedDate]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleSlotClick = (slot: Slot) => {
    if (isStudent) return;
    if (userBookingToday) return;
    if (slot.status !== "available") return;

    setSelectedSlot(slot);
    setIsConfirmOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    setToastMsg(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId,
          date: selectedDate,
          slotStart: selectedSlot.slotStart,
          slotEnd: selectedSlot.slotEnd,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setToastMsg({
          type: "error",
          text: resData.error || "Failed to create booking.",
        });
      } else {
        setToastMsg({
          type: "success",
          text: "Booking request submitted successfully!",
        });
        fetchAvailability();
      }
    } catch {
      setToastMsg({
        type: "error",
        text: "An error occurred while submitting booking.",
      });
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
      setSelectedSlot(null);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
    } catch {
      return isoString;
    }
  };

  const [waitlistSubmittingSlot, setWaitlistSubmittingSlot] = useState<string | null>(null);

  const handleJoinWaitlist = async (slot: Slot) => {
    if (isStudent || userBookingToday) return;

    setWaitlistSubmittingSlot(slot.slotStart);
    setToastMsg(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId,
          date: selectedDate,
          slotStart: slot.slotStart,
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setToastMsg({
          type: "success",
          text: `You are #${data.position} on the waitlist`,
        });
      } else if (res.status === 409 && data.error === "Already on waitlist") {
        setToastMsg({
          type: "error",
          text: "Already on waitlist for this slot",
        });
      } else if (res.status === 400 && data.error === "Slot is available, book directly") {
        setToastMsg({
          type: "error",
          text: "Slot is available, book directly",
        });
        fetchAvailability();
      } else {
        setToastMsg({
          type: "error",
          text: data.error || "Failed to join waitlist",
        });
      }
    } catch {
      setToastMsg({
        type: "error",
        text: "An error occurred while joining waitlist.",
      });
    } finally {
      setWaitlistSubmittingSlot(null);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Slot Availability</h3>
          <p className="text-sm text-gray-500">
            {selectedDate} &bull; {facilityName}
          </p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500" /> Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500" /> Booked
          </span>
        </div>
      </div>

      {toastMsg && (
        <div
          className={`flex items-center justify-between rounded-md p-3 text-sm font-medium ${
            toastMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span className="flex items-center gap-2">
            {toastMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            {toastMsg.text}
          </span>
          <button
            onClick={() => setToastMsg(null)}
            className="text-xs font-semibold underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {userBookingToday && (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>You have already booked a slot today.</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">
          No slots available for the selected facility or date.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {slots.map((slot, index) => {
            const isAvailable = slot.status === "available";
            const isBooked = slot.status === "booked";
            const isPending = slot.status === "pending";

            const disabled =
              !isAvailable || userBookingToday || isStudent || facilityStatus !== "AVAILABLE";

            let buttonStyles = "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100";
            let labelText = "Available";

            if (isBooked) {
              buttonStyles = "border-rose-200 bg-rose-50 text-rose-700 cursor-not-allowed";
              labelText = "Booked";
            } else if (isPending) {
              buttonStyles = "border-amber-200 bg-amber-50 text-amber-800 cursor-not-allowed";
              labelText = "Pending";
            }

            if (disabled && isAvailable) {
              buttonStyles = "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60";
            }

            return (
              <div key={index} className="flex flex-col gap-1.5">
                <button
                  disabled={disabled}
                  onClick={() => handleSlotClick(slot)}
                  className={`flex flex-col items-center justify-center rounded-md border p-3 text-center transition-all w-full ${buttonStyles}`}
                >
                  <span className="flex items-center gap-1 text-sm font-bold">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(slot.slotStart)} - {formatTime(slot.slotEnd)}
                  </span>
                  <span className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-80">
                    {labelText}
                  </span>
                </button>
                {isBooked && !isStudent && (
                  <button
                    disabled={userBookingToday || waitlistSubmittingSlot === slot.slotStart}
                    onClick={() => handleJoinWaitlist(slot)}
                    className="w-full text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {waitlistSubmittingSlot === slot.slotStart
                      ? "Joining..."
                      : "Join Waitlist"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation AlertDialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Booking Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to request this booking slot?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedSlot && (
            <div className="my-2 space-y-1 text-sm text-gray-700 rounded-md bg-gray-50 p-3 border border-gray-200">
              <p>
                <strong>Facility:</strong> {facilityName}
              </p>
              <p className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                <strong>Date:</strong> {selectedDate}
              </p>
              <p className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-gray-500" />
                <strong>Time:</strong> {formatTime(selectedSlot.slotStart)} -{" "}
                {formatTime(selectedSlot.slotEnd)}
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isSubmitting} onClick={handleConfirmBooking}>
              {isSubmitting ? "Submitting..." : "Confirm Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

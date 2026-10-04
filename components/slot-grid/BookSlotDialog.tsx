"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate, formatTime } from "@/lib/utils";
import { Building2, MapPin, Calendar, Clock, Loader2, AlertCircle } from "lucide-react";

interface BookSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string;
  facilityName: string;
  facilityLocation: string;
  facilityType: string;
  selectedDate: string;
  slotStart: string;
  slotEnd: string;
  onSuccess: () => void;
  onToast: (message: string) => void;
  onBookingSuccess?: () => void;
}

export function BookSlotDialog({
  open,
  onOpenChange,
  facilityId,
  facilityName,
  facilityLocation,
  facilityType,
  selectedDate,
  slotStart,
  slotEnd,
  onSuccess,
  onToast,
  onBookingSuccess,
}: BookSlotDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId,
          date: selectedDate,
          slotStart,
          slotEnd,
        }),
      });

      const resData = await res.json();

      if (res.status === 409) {
        if (resData.error === "Slot just taken" || resData.error?.includes("already booked")) {
          onToast("Slot was just taken — try another.");
        } else if (resData.error === "Daily booking limit reached") {
          onToast("You've already booked a slot today.");
        } else {
          onToast(resData.error || "Booking conflict detected.");
        }
        onSuccess();
        onOpenChange(false);
      } else if (res.status === 403 && resData.restrictedUntil) {
        onToast(`Your booking access is restricted until ${new Date(resData.restrictedUntil).toLocaleString()}.`);
        onOpenChange(false);
      } else if (!res.ok) {
        setErrorMsg(resData.error || "Failed to submit booking request.");
      } else {
        onToast("Booking requested successfully!");
        onSuccess();
        onBookingSuccess?.();
        onOpenChange(false);
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-foreground">
            Confirm Booking
          </DialogTitle>
        </DialogHeader>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Booking Summary Card */}
        <div className="rounded-xl bg-muted/30 p-4 border border-border/50 space-y-3">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-sm text-foreground">{facilityName}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {facilityType}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{facilityLocation}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{formatDate(selectedDate)}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-mono">
              {formatTime(slotStart)} &ndash; {formatTime(slotEnd)}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Booking requests are subject to admin approval. You will be notified by email.
        </p>

        <DialogFooter className="gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Requesting...</span>
              </>
            ) : (
              <span>Request Booking</span>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

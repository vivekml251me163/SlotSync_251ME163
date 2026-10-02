"use client";

import { useState } from "react";
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
import { formatDate, formatTime } from "@/lib/utils";
import { Building2, MapPin, Calendar, Clock, Loader2 } from "lucide-react";

interface JoinWaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string;
  facilityName: string;
  facilityLocation: string;
  selectedDate: string;
  slotStart: string;
  slotEnd: string;
  onSuccess: () => void;
  onToast: (message: string) => void;
}

export function JoinWaitlistDialog({
  open,
  onOpenChange,
  facilityId,
  facilityName,
  facilityLocation,
  selectedDate,
  slotStart,
  slotEnd,
  onSuccess,
  onToast,
}: JoinWaitlistDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId,
          date: selectedDate,
          slotStart,
        }),
      });

      const resData = await res.json();

      if (res.status === 201) {
        onToast(`You're #${resData.position} on the waitlist for this slot.`);
        onSuccess();
        onOpenChange(false);
      } else if (res.status === 409 && resData.error === "Already on waitlist") {
        onToast("Already on waitlist for this slot.");
        onOpenChange(false);
      } else if (res.status === 400 && resData.error === "Slot is available, book directly") {
        onToast("Slot is available, book directly!");
        onSuccess();
        onOpenChange(false);
      } else {
        onToast(resData.error || "Failed to join waitlist.");
      }
    } catch {
      onToast("An error occurred while joining waitlist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl font-semibold text-foreground">
            Join Waitlist?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            You&apos;ll be added to the waitlist for this slot. If the booking is cancelled, you&apos;ll be automatically promoted and notified.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Booking Summary Card */}
        <div className="rounded-xl bg-muted/30 p-4 border border-border/50 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <span>{facilityName}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{facilityLocation}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{formatDate(selectedDate)}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-mono">
              {formatTime(slotStart)} &ndash; {formatTime(slotEnd)}
            </span>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 pt-2">
          <AlertDialogCancel disabled={isSubmitting} className="border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={(e) => {
              e.preventDefault();
              handleJoin();
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Joining...</span>
              </>
            ) : (
              <span>Join Waitlist</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

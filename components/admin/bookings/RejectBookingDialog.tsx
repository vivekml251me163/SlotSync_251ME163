"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatTime } from "@/lib/utils";
import { Loader2, AlertCircle } from "lucide-react";

const rejectSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, "Rejection reason must be at least 10 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

type RejectInput = z.infer<typeof rejectSchema>;

interface RejectBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  userName: string;
  facilityName: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  onSuccess: () => void;
  onErrorToast: (message: string) => void;
}

export function RejectBookingDialog({
  open,
  onOpenChange,
  bookingId,
  userName,
  facilityName,
  date,
  slotStart,
  slotEnd,
  onSuccess,
  onErrorToast,
}: RejectBookingDialogProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RejectInput>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      rejectionReason: "",
    },
  });

  const reasonValue = watch("rejectionReason") || "";

  const onSubmit = async (data: RejectInput) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT",
          rejectionReason: data.rejectionReason,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setErrorMsg(resData.error || "Failed to reject booking.");
      } else {
        reset();
        onSuccess();
        onOpenChange(false);
      }
    } catch {
      setErrorMsg("An error occurred while rejecting booking.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-foreground">
            Reject Booking
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Provide a reason for rejection. This will be sent to <strong className="text-foreground">{userName}</strong>.
          </p>
        </DialogHeader>

        {/* Booking Summary Card */}
        <div className="rounded-lg bg-muted/30 p-3.5 border border-border/50 text-xs space-y-1 text-foreground">
          <p>
            <strong className="text-muted-foreground">Facility:</strong> {facilityName}
          </p>
          <p>
            <strong className="text-muted-foreground">Date:</strong> {formatDate(date)}
          </p>
          <p>
            <strong className="text-muted-foreground">Slot Time:</strong> {formatTime(slotStart)} &ndash; {formatTime(slotEnd)}
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rejectionReason">Rejection Reason</Label>
            <Textarea
              id="rejectionReason"
              placeholder="e.g. Facility is reserved for an official department symposium."
              className="bg-background border-border resize-none min-h-[100px] text-sm focus-visible:ring-primary/50"
              {...register("rejectionReason")}
            />
            <div className="flex items-center justify-between text-xs mt-1">
              {errors.rejectionReason ? (
                <span className="text-destructive font-medium">
                  {errors.rejectionReason.message}
                </span>
              ) : (
                <span />
              )}
              <span className="text-muted-foreground">
                {reasonValue.length}/500
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Rejecting...</span>
                </>
              ) : (
                <span>Reject Booking</span>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

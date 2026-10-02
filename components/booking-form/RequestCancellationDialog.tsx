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

const cancelSchema = z.object({
  cancelReason: z
    .string()
    .min(10, "Cancellation reason must be at least 10 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

type CancelInput = z.infer<typeof cancelSchema>;

interface RequestCancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  facilityName: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  onSuccess: () => void;
  onToast: (message: string) => void;
}

export function RequestCancellationDialog({
  open,
  onOpenChange,
  bookingId,
  facilityName,
  date,
  slotStart,
  slotEnd,
  onSuccess,
  onToast,
}: RequestCancellationDialogProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CancelInput>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      cancelReason: "",
    },
  });

  const reasonValue = watch("cancelReason") || "";

  const onSubmit = async (data: CancelInput) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REQUEST_CANCELLATION",
          cancelReason: data.cancelReason,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setErrorMsg(resData.error || "Failed to submit cancellation request.");
      } else {
        reset();
        onToast("Cancellation request submitted successfully.");
        onSuccess();
        onOpenChange(false);
      }
    } catch {
      setErrorMsg("An error occurred while requesting cancellation.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-foreground">
            Request Cancellation
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Cancellations require admin approval. Provide a reason below.
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
            <Label htmlFor="cancelReason">Reason for Cancellation</Label>
            <Textarea
              id="cancelReason"
              placeholder="e.g. Rescheduled due to unavoidable departmental meeting."
              className="bg-background border-border resize-none min-h-[100px] text-sm focus-visible:ring-primary/50"
              {...register("cancelReason")}
            />
            <div className="flex items-center justify-between text-xs mt-1">
              {errors.cancelReason ? (
                <span className="text-destructive font-medium">
                  {errors.cancelReason.message}
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
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

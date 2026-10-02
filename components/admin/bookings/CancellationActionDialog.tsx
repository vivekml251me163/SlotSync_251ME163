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
import { Loader2 } from "lucide-react";

interface CancellationActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  mode: "APPROVE" | "REJECT";
  cancelReason?: string | null;
  onSuccess: () => void;
  onErrorToast: (message: string) => void;
}

export function CancellationActionDialog({
  open,
  onOpenChange,
  bookingId,
  mode,
  cancelReason,
  onSuccess,
  onErrorToast,
}: CancellationActionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isApprove = mode === "APPROVE";

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      const action = isApprove ? "APPROVE_CANCELLATION" : "REJECT_CANCELLATION";
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const resData = await res.json();

      if (!res.ok) {
        onErrorToast(resData.error || "Failed to process cancellation request.");
      } else {
        onSuccess();
        onOpenChange(false);
      }
    } catch {
      onErrorToast("An error occurred while processing cancellation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl font-semibold text-foreground">
            {isApprove ? "Approve Cancellation?" : "Reject Cancellation?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm space-y-3">
            <span>
              {isApprove
                ? "The booking will be cancelled and the next person on the waitlist (if any) will be automatically promoted."
                : "The booking will remain Approved and the user will be notified."}
            </span>

            {cancelReason && (
              <span className="block mt-2 rounded-lg bg-muted/30 p-3 text-xs italic border border-border/50 text-foreground">
                &ldquo;{cancelReason}&rdquo;
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 pt-4">
          <AlertDialogCancel disabled={isSubmitting} className="border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={(e) => {
              e.preventDefault();
              handleAction();
            }}
            className={
              isApprove
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isApprove ? "Approve Cancellation" : "Reject Cancellation"}</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

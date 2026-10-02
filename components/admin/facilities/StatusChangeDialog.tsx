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

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string;
  targetStatus: string;
  activeCount: number;
  onSuccess: () => void;
  onErrorToast: (message: string) => void;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  facilityId,
  targetStatus,
  activeCount,
  onSuccess,
  onErrorToast,
}: StatusChangeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForceUpdate = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/facilities/${facilityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          force: true,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        onErrorToast(resData.error || "Failed to update status.");
      } else {
        onSuccess();
        onOpenChange(false);
      }
    } catch {
      onErrorToast("An error occurred while updating facility status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl font-semibold text-foreground">
            Change Facility Status?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            There are <strong className="text-foreground">{activeCount} active booking(s)</strong> for this facility. Changing status will not cancel them — admins must handle those manually.
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
              handleForceUpdate();
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Proceed Anyway</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

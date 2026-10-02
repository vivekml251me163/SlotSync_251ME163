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

interface DeleteFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string;
  facilityName: string;
  onSuccess: () => void;
  onErrorToast: (message: string) => void;
}

export function DeleteFacilityDialog({
  open,
  onOpenChange,
  facilityId,
  facilityName,
  onSuccess,
  onErrorToast,
}: DeleteFacilityDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/facilities/${facilityId}`, {
        method: "DELETE",
      });

      const resData = await res.json();

      if (res.status === 409) {
        onOpenChange(false);
        onErrorToast("Cannot delete — active bookings exist for this facility.");
      } else if (!res.ok) {
        onOpenChange(false);
        onErrorToast(resData.error || "Failed to delete facility.");
      } else {
        onSuccess();
        onOpenChange(false);
      }
    } catch {
      onOpenChange(false);
      onErrorToast("An error occurred while deleting facility.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl font-semibold text-foreground">
            Delete Facility?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            This will permanently delete <strong className="text-foreground">{facilityName}</strong>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 pt-4">
          <AlertDialogCancel disabled={isDeleting} className="border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

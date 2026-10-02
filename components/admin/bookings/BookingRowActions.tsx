"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RejectBookingDialog } from "./RejectBookingDialog";
import { CancellationActionDialog } from "./CancellationActionDialog";
import {
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  Ban,
} from "lucide-react";

export type BookingWithRelations = {
  id: string;
  userId: string;
  facilityId: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  status: string;
  rejectionReason: string | null;
  cancelReason: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string; role: string } | null;
  facility?: { id: string; name: string; type: string; location: string } | null;
};

interface BookingRowActionsProps {
  booking: BookingWithRelations;
  onRefresh: () => void;
  onToast: (message: string) => void;
}

export function BookingRowActions({
  booking,
  onRefresh,
  onToast,
}: BookingRowActionsProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // Cancellation dialog state
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelDialogMode, setCancelDialogMode] = useState<"APPROVE" | "REJECT">("APPROVE");

  const handleDirectApprove = async () => {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });

      const resData = await res.json();

      if (res.status === 409) {
        onToast("Booking was already processed by another admin.");
      } else if (!res.ok) {
        onToast(resData.error || "Failed to approve booking.");
      } else {
        onRefresh();
        onToast("Booking approved successfully.");
      }
    } catch {
      onToast("An error occurred while approving booking.");
    } finally {
      setIsApproving(false);
    }
  };

  const isPending = booking.status === "PENDING";
  const isCancelRequested = booking.status === "CANCELLATION_REQUESTED";
  const isFinalStatus = ["APPROVED", "REJECTED", "CANCELLED"].includes(booking.status);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
            <span className="sr-only">Open menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card border-border w-52">
          {isPending && (
            <>
              <DropdownMenuItem
                disabled={isApproving}
                onClick={handleDirectApprove}
                className="flex items-center gap-2 cursor-pointer text-emerald-400 focus:text-emerald-400 font-medium"
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>Approve Booking</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border" />

              <DropdownMenuItem
                onClick={() => setIsRejectDialogOpen(true)}
                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive font-medium"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject Booking</span>
              </DropdownMenuItem>
            </>
          )}

          {isCancelRequested && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  setCancelDialogMode("APPROVE");
                  setIsCancelDialogOpen(true);
                }}
                className="flex items-center gap-2 cursor-pointer text-emerald-400 focus:text-emerald-400 font-medium"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve Cancellation</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border" />

              <DropdownMenuItem
                onClick={() => {
                  setCancelDialogMode("REJECT");
                  setIsCancelDialogOpen(true);
                }}
                className="flex items-center gap-2 cursor-pointer text-amber-400 focus:text-amber-400 font-medium"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reject Cancellation</span>
              </DropdownMenuItem>
            </>
          )}

          {isFinalStatus && (
            <DropdownMenuItem disabled className="flex items-center gap-2 text-muted-foreground">
              <Ban className="h-4 w-4 opacity-60" />
              <span>No actions available</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reject Booking Dialog */}
      <RejectBookingDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        bookingId={booking.id}
        userName={booking.user?.name || "User"}
        facilityName={booking.facility?.name || "Facility"}
        date={booking.date}
        slotStart={booking.slotStart}
        slotEnd={booking.slotEnd}
        onSuccess={() => {
          onRefresh();
          onToast("Booking rejected.");
        }}
        onErrorToast={onToast}
      />

      {/* Cancellation Action Dialog */}
      <CancellationActionDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        bookingId={booking.id}
        mode={cancelDialogMode}
        cancelReason={booking.cancelReason}
        onSuccess={() => {
          onRefresh();
          onToast(
            cancelDialogMode === "APPROVE"
              ? "Cancellation approved."
              : "Cancellation request rejected."
          );
        }}
        onErrorToast={onToast}
      />
    </>
  );
}

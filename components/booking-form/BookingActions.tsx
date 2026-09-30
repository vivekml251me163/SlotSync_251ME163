"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Booking {
  id: string;
  status: string;
  userId: string;
}

interface BookingActionsProps {
  booking: Booking;
  isAdmin?: boolean;
}

export function BookingActions({ booking, isAdmin = false }: BookingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rejection Dialog state
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Cancellation Request Dialog state
  const [isCancelRequestOpen, setIsCancelRequestOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleAction = async (payload: Record<string, unknown>) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        setErrorMsg(resData.error || "Action failed.");
      } else {
        router.refresh();
      }
    } catch {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setIsRejectOpen(false);
      setIsCancelRequestOpen(false);
    }
  };

  if (isAdmin) {
    if (booking.status === "PENDING") {
      return (
        <div className="flex flex-col items-end space-y-1">
          {errorMsg && <span className="text-xs text-red-600 font-medium">{errorMsg}</span>}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading}
              onClick={() => handleAction({ action: "APPROVE" })}
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isLoading}
              onClick={() => setIsRejectOpen(true)}
            >
              Reject
            </Button>
          </div>

          <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Booking Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rejection Reason (min 10 characters)
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Provide detailed reason for rejection..."
                  />
                  {rejectionReason.length < 10 && rejectionReason.length > 0 && (
                    <p className="mt-1 text-xs text-red-500">
                      Reason must be at least 10 characters ({rejectionReason.length}/10)
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsRejectOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={isLoading || rejectionReason.trim().length < 10}
                    onClick={() => handleAction({ action: "REJECT", rejectionReason })}
                  >
                    Submit Rejection
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    if (booking.status === "CANCELLATION_REQUESTED") {
      return (
        <div className="flex flex-col items-end space-y-1">
          {errorMsg && <span className="text-xs text-red-600 font-medium">{errorMsg}</span>}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading}
              onClick={() => handleAction({ action: "APPROVE_CANCELLATION" })}
            >
              Approve Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => handleAction({ action: "REJECT_CANCELLATION" })}
            >
              Reject Cancel
            </Button>
          </div>
        </div>
      );
    }

    return <span className="text-xs text-gray-400">-</span>;
  }

  // Non-Admin (Faculty/Convenor) Actions
  if (booking.status === "PENDING") {
    return (
      <div className="flex items-center space-x-2">
        {errorMsg && <span className="text-xs text-red-600 font-medium mr-2">{errorMsg}</span>}
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => handleAction({ action: "CANCEL" })}
        >
          Cancel Request
        </Button>
      </div>
    );
  }

  if (booking.status === "APPROVED") {
    return (
      <div className="flex flex-col items-end space-y-1">
        {errorMsg && <span className="text-xs text-red-600 font-medium">{errorMsg}</span>}
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => setIsCancelRequestOpen(true)}
        >
          Request Cancellation
        </Button>

        <Dialog open={isCancelRequestOpen} onOpenChange={setIsCancelRequestOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Booking Cancellation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reason for Cancellation (min 10 characters)
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Explain why you wish to cancel this booking..."
                />
                {cancelReason.length < 10 && cancelReason.length > 0 && (
                  <p className="mt-1 text-xs text-red-500">
                    Reason must be at least 10 characters ({cancelReason.length}/10)
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCancelRequestOpen(false)}
                  disabled={isLoading}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  disabled={isLoading || cancelReason.trim().length < 10}
                  onClick={() => handleAction({ action: "REQUEST_CANCELLATION", cancelReason })}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (booking.status === "CANCELLATION_REQUESTED") {
    return <Badge variant="warning">Awaiting admin approval</Badge>;
  }

  return <span className="text-xs text-gray-400">-</span>;
}

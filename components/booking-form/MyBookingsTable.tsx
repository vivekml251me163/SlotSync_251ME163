"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { RequestCancellationDialog } from "./RequestCancellationDialog";
import { formatDate, formatTime, relativeTime } from "@/lib/utils";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarDays, Info, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface UserBooking {
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
  facility?: {
    name: string;
    location: string;
    type: string;
  } | null;
}

function getTypeBadge(type?: string) {
  if (!type) return null;
  const typeMap: Record<string, { label: string; className: string }> = {
    classroom: { label: "Classroom", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    seminar_hall: { label: "Seminar Hall", className: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
    lab: { label: "Lab", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    sports: { label: "Sports", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  };
  const conf = typeMap[type] || { label: type, className: "bg-slate-500/15 text-slate-400 border-slate-500/30" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${conf.className}`}>
      {conf.label}
    </span>
  );
}

interface MyBookingsTableProps {
  /** Called after data loads. activeCount = PENDING+APPROVED+CANCELLATION_REQUESTED */
  onCountsUpdate?: (activeCount: number, approvedCount: number, pendingCount: number) => void;
}

export function MyBookingsTable({ onCountsUpdate }: MyBookingsTableProps) {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Cancellation Request Dialog state
  const [requestCancelBooking, setRequestCancelBooking] = useState<UserBooking | null>(null);

  // Direct Cancel AlertDialog state
  const [directCancelBooking, setDirectCancelBooking] = useState<UserBooking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchMyBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (res.ok) {
        const list = data || [];
        setBookings(list);
        const activeCount = list.filter((b: UserBooking) =>
          ["PENDING", "APPROVED", "CANCELLATION_REQUESTED"].includes(b.status)
        ).length;
        const approvedCount = list.filter((b: UserBooking) => b.status === "APPROVED").length;
        const pendingCount = list.filter((b: UserBooking) => b.status === "PENDING").length;
        if (onCountsUpdate) onCountsUpdate(activeCount, approvedCount, pendingCount);
      }
    } catch {
      console.error("Failed to fetch user bookings");
    } finally {
      setIsLoading(false);
    }
  }, [onCountsUpdate]);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const handleDirectCancel = async () => {
    if (!directCancelBooking) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${directCancelBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL" }),
      });

      if (!res.ok) {
        setToastMsg({ type: "error", text: "Failed to cancel booking." });
      } else {
        setToastMsg({ type: "success", text: "Booking cancelled successfully." });
        fetchMyBookings();
      }
    } catch {
      setToastMsg({ type: "error", text: "An error occurred while cancelling booking." });
    } finally {
      setIsCancelling(false);
      setDirectCancelBooking(null);
    }
  };

  const columns = useMemo<ColumnDef<UserBooking>[]>(
    () => [
      {
        id: "facility",
        header: "Facility",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-semibold text-foreground text-sm">
              {row.original.facility?.name || "Facility"}
            </div>
            <div>{getTypeBadge(row.original.facility?.type)}</div>
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="font-mono text-sm text-foreground">
            {formatDate(row.original.date)}
          </span>
        ),
      },
      {
        id: "slot",
        header: "Time Slot",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground">
            {formatTime(row.original.slotStart)} &ndash; {formatTime(row.original.slotEnd)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const b = row.original;
          if (b.status === "REJECTED" && b.rejectionReason) {
            return (
              <div className="flex items-center gap-1.5">
                <StatusBadge status={b.status} />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-card border border-border text-xs max-w-xs p-2">
                      <p className="font-semibold text-destructive">Rejection Reason:</p>
                      <p className="text-muted-foreground">{b.rejectionReason}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          }
          return <StatusBadge status={b.status} />;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Requested",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {relativeTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const b = row.original;
          if (b.status === "PENDING") {
            return (
              <button
                onClick={() => setDirectCancelBooking(b)}
                className="text-xs font-semibold text-destructive hover:underline"
              >
                Cancel
              </button>
            );
          }
          if (b.status === "APPROVED") {
            return (
              <button
                onClick={() => setRequestCancelBooking(b)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
              >
                Request Cancellation
              </button>
            );
          }
          if (b.status === "CANCELLATION_REQUESTED") {
            return (
              <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                Awaiting admin
              </span>
            );
          }
          return null;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: bookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {toastMsg && (
        <div
          className={`flex items-center justify-between rounded-lg p-3 text-sm font-medium ${
            toastMsg.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          <span className="flex items-center gap-2">
            {toastMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {toastMsg.text}
          </span>
          <button
            onClick={() => setToastMsg(null)}
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3.5 font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-xs text-muted-foreground">
                  Loading your bookings...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                      <CalendarDays className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-foreground">
                        No bookings yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Use the Book a Slot tab to make your first booking.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-accent/50 transition-colors cursor-default">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Direct Cancel Confirmation Dialog */}
      {directCancelBooking && (
        <AlertDialog open={!!directCancelBooking} onOpenChange={() => setDirectCancelBooking(null)}>
          <AlertDialogContent className="bg-card border-border sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-xl font-semibold text-foreground">
                Cancel Booking?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm">
                Are you sure you want to cancel your pending booking for <strong className="text-foreground">{directCancelBooking.facility?.name}</strong> on {directCancelBooking.date}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 pt-2">
              <AlertDialogCancel disabled={isCancelling} className="border-border">
                Keep Booking
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isCancelling}
                onClick={(e) => {
                  e.preventDefault();
                  handleDirectCancel();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel</span>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Request Cancellation Dialog */}
      {requestCancelBooking && (
        <RequestCancellationDialog
          open={!!requestCancelBooking}
          onOpenChange={(open) => !open && setRequestCancelBooking(null)}
          bookingId={requestCancelBooking.id}
          facilityName={requestCancelBooking.facility?.name || "Facility"}
          date={requestCancelBooking.date}
          slotStart={requestCancelBooking.slotStart}
          slotEnd={requestCancelBooking.slotEnd}
          onSuccess={fetchMyBookings}
          onToast={(text) => setToastMsg({ type: "success", text })}
        />
      )}
    </div>
  );
}

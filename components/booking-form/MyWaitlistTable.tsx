"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
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
import { Clock, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface WaitlistEntry {
  id: string;
  userId: string;
  facilityId: string;
  date: string;
  slotStart: string;
  position: number;
  createdAt: string;
  facility?: {
    id: string;
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

interface MyWaitlistTableProps {
  onCountsUpdate?: (waitlistCount: number) => void;
}

export function MyWaitlistTable({ onCountsUpdate }: MyWaitlistTableProps) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [leavingEntry, setLeavingEntry] = useState<WaitlistEntry | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const fetchMyWaitlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/waitlist");
      const data = await res.json();
      if (res.ok) {
        const list = data || [];
        setWaitlist(list);
        if (onCountsUpdate) onCountsUpdate(list.length);
      }
    } catch {
      console.error("Failed to fetch user waitlist");
    } finally {
      setIsLoading(false);
    }
  }, [onCountsUpdate]);

  useEffect(() => {
    fetchMyWaitlist();
  }, [fetchMyWaitlist]);

  useEffect(() => {
    const onFocus = () => fetchMyWaitlist();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchMyWaitlist]);

  const handleLeaveWaitlist = async () => {
    if (!leavingEntry) return;
    setIsLeaving(true);
    try {
      const res = await fetch(`/api/waitlist/${leavingEntry.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setToastMsg({ type: "error", text: "Failed to leave waitlist." });
      } else {
        setToastMsg({ type: "success", text: "Left waitlist successfully." });
        fetchMyWaitlist();
      }
    } catch {
      setToastMsg({ type: "error", text: "An error occurred while leaving waitlist." });
    } finally {
      setIsLeaving(false);
      setLeavingEntry(null);
    }
  };

  const columns = useMemo<ColumnDef<WaitlistEntry>[]>(
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
            {formatTime(row.original.slotStart)}
          </span>
        ),
      },
      {
        accessorKey: "position",
        header: "Position",
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
            #{row.original.position}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {relativeTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            onClick={() => setLeavingEntry(row.original)}
            className="text-xs font-semibold text-destructive hover:underline"
          >
            Leave Waitlist
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: waitlist,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Header bar with Refresh button */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold text-foreground">Your Active Waitlists</span>
        <button
          onClick={() => fetchMyWaitlist()}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-card border border-border hover:bg-accent hover:text-foreground text-muted-foreground transition-colors disabled:opacity-50"
          title="Refresh waitlist data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh Waitlist</span>
        </button>
      </div>
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
                  Loading waitlist entries...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                      <Clock className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-foreground">
                        Not on any waitlists
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Join a waitlist from the Book a Slot tab when a slot is fully booked.
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

      {/* Leave Waitlist Confirmation Dialog */}
      {leavingEntry && (
        <AlertDialog open={!!leavingEntry} onOpenChange={() => setLeavingEntry(null)}>
          <AlertDialogContent className="bg-card border-border sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-xl font-semibold text-foreground">
                Leave Waitlist?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm">
                Are you sure you want to leave the waitlist for <strong className="text-foreground">{leavingEntry.facility?.name}</strong> on {leavingEntry.date}? Your position #{leavingEntry.position} will be released.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 pt-2">
              <AlertDialogCancel disabled={isLeaving} className="border-border">
                Stay on Waitlist
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isLeaving}
                onClick={(e) => {
                  e.preventDefault();
                  handleLeaveWaitlist();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLeaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    <span>Leaving...</span>
                  </>
                ) : (
                  <span>Yes, Leave</span>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

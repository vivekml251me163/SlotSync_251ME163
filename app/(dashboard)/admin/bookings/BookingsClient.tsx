"use client";

import { useEffect, useState, useCallback } from "react";
import { BookingsTable } from "@/components/admin/bookings/BookingsTable";
import { BookingWithRelations } from "@/components/admin/bookings/BookingRowActions";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, CheckCircle2, XCircle, RotateCcw, RefreshCw } from "lucide-react";

export default function AdminBookingsClient() {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((b: any) => ({
          ...b,
          date: String(b.date),
          slotStart: new Date(b.slotStart).toISOString(),
          slotEnd: new Date(b.slotEnd).toISOString(),
          createdAt: new Date(b.createdAt).toISOString(),
        }));
        setBookings(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl bg-card border border-border" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg bg-card" />
          ))}
        </div>
      </div>
    );
  }

  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const approvedCount = bookings.filter((b) => b.status === "APPROVED").length;
  const rejectedCount = bookings.filter((b) => b.status === "REJECTED").length;
  const cancelReqCount = bookings.filter((b) => b.status === "CANCELLATION_REQUESTED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Bookings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage all campus booking requests, approvals, and cancellations.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-card border border-border hover:bg-accent hover:text-foreground text-muted-foreground transition-colors disabled:opacity-50 shrink-0 mt-1"
          title="Refresh bookings"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total
              </p>
              <p className="font-display text-2xl font-semibold text-foreground mt-1">
                {totalCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Pending
              </p>
              <p className="font-display text-2xl font-semibold text-yellow-400 mt-1">
                {pendingCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Approved
              </p>
              <p className="font-display text-2xl font-semibold text-green-400 mt-1">
                {approvedCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Rejected
              </p>
              <p className="font-display text-2xl font-semibold text-red-400 mt-1">
                {rejectedCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cancel Requested
              </p>
              <p className="font-display text-2xl font-semibold text-orange-400 mt-1">
                {cancelReqCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              <RotateCcw className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <BookingsTable bookings={bookings} onRefresh={loadData} />
    </div>
  );
}

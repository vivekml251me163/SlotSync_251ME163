"use client";

import { useEffect, useState, useCallback } from "react";
import { BookingsTable } from "@/components/admin/bookings/BookingsTable";
import { BookingWithRelations } from "@/components/admin/bookings/BookingRowActions";
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

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-up">
        <Skeleton className="h-16 w-full rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl bg-white/[0.03]" />
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

  const stats = [
    { label: "Total", value: totalCount, icon: Calendar, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "Pending", value: pendingCount, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Approved", value: approvedCount, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Rejected", value: rejectedCount, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Cancel Req.", value: cancelReqCount, icon: RotateCcw, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  ];

  return (
    <div className="space-y-7 animate-fade-up">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">
            Admin / Bookings
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Bookings
          </h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Review and manage all campus booking requests, approvals, and cancellations.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-50 shrink-0 mt-6"
          title="Refresh bookings"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4 glow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                {label}
              </p>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg} border ${border}`}>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
            </div>
            <p className={`font-display text-2xl font-semibold ${color}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div>
        <BookingsTable bookings={bookings} onRefresh={loadData} />
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState, useCallback } from "react";
import { FacultyBookingTabs } from "@/components/booking-form/FacultyBookingTabs";
import { CalendarCheck, Clock, ListOrdered } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Facility } from "@/lib/db/schema";

interface FacultyBookingsClientProps {
  isStudent: boolean;
}

export default function FacultyBookingsClient({ isStudent }: FacultyBookingsClientProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Counts — fetched independently so stats show immediately on page load
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [waitlistCount, setWaitlistCount] = useState(0);

  // Fetch counts directly (not from tab children)
  const fetchCounts = useCallback(async () => {
    try {
      const [bookingsRes, waitlistRes] = await Promise.all([
        fetch("/api/bookings/my"),
        fetch("/api/waitlist/my"),
      ]);
      if (bookingsRes.ok) {
        const bookings = await bookingsRes.json();
        setApprovedCount(
          bookings.filter((b: any) => b.status === "APPROVED").length
        );
        setPendingCount(
          bookings.filter((b: any) => b.status === "PENDING").length
        );
      }
      if (waitlistRes.ok) {
        const waitlist = await waitlistRes.json();
        setWaitlistCount(Array.isArray(waitlist) ? waitlist.length : 0);
      }
    } catch (err) {
      console.error("Failed to fetch counts:", err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/facilities");
        if (res.ok) setFacilities(await res.json());
      } catch (err) {
        console.error("Failed to fetch facilities:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
    if (!isStudent) fetchCounts();
  }, [isStudent, fetchCounts]);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-up">
        <Skeleton className="h-12 w-full rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
        <Skeleton className="h-96 w-full rounded-2xl bg-white/[0.03]" />
      </div>
    );
  }

  const stats = [
    { label: "Active Bookings", value: approvedCount, icon: CalendarCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Pending Requests", value: pendingCount, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Waitlist Entries", value: waitlistCount, icon: ListOrdered, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  ];

  return (
    <div className="space-y-7 animate-fade-up">
      {/* ── Page Header ── */}
      <div>
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">
          {isStudent ? "Student" : "Faculty"} / Bookings
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Bookings
        </h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Reserve campus facilities and track your requests.
        </p>
      </div>

      {/* ── Stat Strip — fetched on mount, updated reactively via tab callbacks ── */}
      {!isStudent && (
        <div className="flex flex-wrap gap-3">
          {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.02] glow-card"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${bg} border ${border}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className={`font-display text-xl font-semibold leading-none ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Booking Tabs — callbacks keep stats in sync after tab interactions ── */}
      <FacultyBookingTabs
        initialFacilities={facilities}
        isStudent={isStudent}
        isReadOnly={isStudent}
        onBookingsCountUpdate={(approved, pending) => {
          setApprovedCount(approved);
          setPendingCount(pending);
        }}
        onWaitlistCountUpdate={setWaitlistCount}
      />
    </div>
  );
}

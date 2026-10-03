"use client";

import { useEffect, useState } from "react";
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

  // Stat strip counts — updated reactively via callbacks from MyBookingsTable / MyWaitlistTable
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    async function loadFacilities() {
      try {
        const res = await fetch("/api/facilities");
        if (res.ok) {
          setFacilities(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch facilities:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFacilities();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl bg-card border border-border" />
        <Skeleton className="h-96 w-full rounded-xl bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Bookings
        </h1>
        <p className="text-sm text-muted-foreground">
          Reserve campus facilities and track your requests.
        </p>
      </div>

      {/* Stat Strip — counts updated via child onCountsUpdate callbacks */}
      {!isStudent && (
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-foreground leading-none">
                {approvedCount}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Active Bookings</p>
            </div>
          </div>

          <div className="w-px h-8 self-center bg-border" />

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-foreground leading-none">
                {pendingCount}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Pending Requests</p>
            </div>
          </div>

          <div className="w-px h-8 self-center bg-border" />

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ListOrdered className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-foreground leading-none">
                {waitlistCount}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Waitlist Entries</p>
            </div>
          </div>
        </div>
      )}

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

import { db } from "@/lib/db";
import { bookings, facilities, waitlist } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, count } from "drizzle-orm";
import { FacultyBookingTabs } from "@/components/booking-form/FacultyBookingTabs";
import { CalendarCheck, Clock, ListOrdered } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FacultyBookingsPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";
  const isStudent = session?.user?.role === "STUDENT";

  const [facilityList, approvedCount, pendingCount, waitlistCount] = await Promise.all([
    db.select().from(facilities).orderBy(facilities.name),

    db
      .select({ count: count() })
      .from(bookings)
      .where(and(eq(bookings.userId, userId), eq(bookings.status, "APPROVED")))
      .then((r) => r[0]?.count ?? 0),

    db
      .select({ count: count() })
      .from(bookings)
      .where(and(eq(bookings.userId, userId), eq(bookings.status, "PENDING")))
      .then((r) => r[0]?.count ?? 0),

    db
      .select({ count: count() })
      .from(waitlist)
      .where(eq(waitlist.userId, userId))
      .then((r) => r[0]?.count ?? 0),
  ]);

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

      {/* Stat Strip — lightweight, not full cards */}
      {!isStudent && (
        <div className="flex flex-wrap gap-6">
          {/* Active Bookings */}
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

          {/* Pending Requests */}
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

          {/* Waitlist Entries */}
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

      {/* Tabbed Booking Interface */}
      <FacultyBookingTabs
        initialFacilities={facilityList}
        isStudent={isStudent}
        isReadOnly={isStudent}
      />
    </div>
  );
}

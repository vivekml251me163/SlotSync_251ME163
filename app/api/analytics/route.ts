import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, ADMIN } from "@/lib/permissions";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireRole(ADMIN);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "weekly"; // daily | weekly | monthly

    let granularity = "week";
    let intervalStr = "12 weeks";
    let dateFormat = "YYYY-MM-DD";

    if (range === "daily") {
      granularity = "day";
      intervalStr = "14 days";
      dateFormat = "YYYY-MM-DD";
    } else if (range === "monthly") {
      granularity = "month";
      intervalStr = "12 months";
      dateFormat = "YYYY-MM";
    }

    // Execute queries in parallel using Promise.allSettled
    const results = await Promise.allSettled([
      // 1. Most booked facilities
      db.execute<{ facilityId: string; facilityName: string; bookingCount: number }>(sql`
        SELECT f.id as "facilityId", f.name as "facilityName", COUNT(b.id)::int as "bookingCount"
        FROM bookings b
        JOIN facilities f ON b.facility_id = f.id
        WHERE b.status IN ('APPROVED', 'COMPLETED')
        GROUP BY f.id, f.name
        ORDER BY "bookingCount" DESC
        LIMIT 5
      `),

      // 2. Peak hours
      db.execute<{ hour: number; bookingCount: number }>(sql`
        SELECT EXTRACT(HOUR FROM slot_start)::int as hour, COUNT(*)::int as "bookingCount"
        FROM bookings
        WHERE status IN ('APPROVED', 'COMPLETED')
        GROUP BY hour
        ORDER BY hour ASC
      `),

      // 3. Usage trend
      db.execute<{
        period: string;
        bookingCount: number;
        approvedCount: number;
        cancelledCount: number;
      }>(sql`
        SELECT
          TO_CHAR(DATE_TRUNC(${granularity}, date::date), ${dateFormat}) as period,
          COUNT(*)::int as "bookingCount",
          COUNT(*) FILTER (WHERE status IN ('APPROVED', 'COMPLETED'))::int as "approvedCount",
          COUNT(*) FILTER (WHERE status = 'CANCELLED')::int as "cancelledCount"
        FROM bookings
        WHERE date::date >= NOW() - CAST(${intervalStr} AS INTERVAL)
        GROUP BY DATE_TRUNC(${granularity}, date::date), period
        ORDER BY DATE_TRUNC(${granularity}, date::date) ASC
      `),

      // 4. Booking stats
      db.execute<{
        total: number;
        approved: number;
        rejected: number;
        cancelled: number;
        pending: number;
      }>(sql`
        SELECT
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status IN ('APPROVED', 'COMPLETED'))::int as approved,
          COUNT(*) FILTER (WHERE status = 'REJECTED')::int as rejected,
          COUNT(*) FILTER (WHERE status = 'CANCELLED')::int as cancelled,
          COUNT(*) FILTER (WHERE status = 'PENDING')::int as pending
        FROM bookings
      `),

      // 5. No-shows count
      db.execute<{ noShows: number }>(sql`
        SELECT COUNT(*)::int as "noShows" FROM penalties
      `),

      // 6. Top users
      db.execute<{ userId: string; userName: string; bookingCount: number }>(sql`
        SELECT u.id as "userId", u.name as "userName", COUNT(b.id)::int as "bookingCount"
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.status IN ('APPROVED', 'COMPLETED')
        GROUP BY u.id, u.name
        ORDER BY "bookingCount" DESC
        LIMIT 5
      `),

      // 7. Waitlist total waiting & avg length
      db.execute<{ totalWaiting: number; avgWaitlistLength: number }>(sql`
        SELECT
          COUNT(*)::int as "totalWaiting",
          COALESCE(AVG(slot_count), 0)::float as "avgWaitlistLength"
        FROM (
          SELECT COUNT(*) as slot_count
          FROM waitlist
          GROUP BY facility_id, date, slot_start
        ) sub
      `),

      // 8. Waitlist promotion count
      db.execute<{ promotionCount: number }>(sql`
        SELECT COUNT(*)::int as "promotionCount"
        FROM bookings
        WHERE promoted_from_waitlist = true
      `),
    ]);

    // Extract values with fallbacks
    const mostBookedFacilities =
      results[0].status === "fulfilled" ? (results[0].value as unknown as Array<{ facilityId: string; facilityName: string; bookingCount: number }>) : [];
    const peakHours =
      results[1].status === "fulfilled" ? (results[1].value as unknown as Array<{ hour: number; bookingCount: number }>) : [];
    const usageTrend =
      results[2].status === "fulfilled"
        ? (results[2].value as unknown as Array<{
            period: string;
            bookingCount: number;
            approvedCount: number;
            cancelledCount: number;
          }>)
        : [];

    const bookingStatsRow =
      results[3].status === "fulfilled" && results[3].value.length > 0
        ? results[3].value[0]
        : { total: 0, approved: 0, rejected: 0, cancelled: 0, pending: 0 };

    const noShowsRow =
      results[4].status === "fulfilled" && results[4].value.length > 0
        ? results[4].value[0]
        : { noShows: 0 };

    const totalStats = {
      total: Number(bookingStatsRow.total || 0),
      approved: Number(bookingStatsRow.approved || 0),
      rejected: Number(bookingStatsRow.rejected || 0),
      cancelled: Number(bookingStatsRow.cancelled || 0),
      pending: Number(bookingStatsRow.pending || 0),
      noShows: Number(noShowsRow.noShows || 0),
    };

    const topUsers =
      results[5].status === "fulfilled" ? (results[5].value as unknown as Array<{ userId: string; userName: string; bookingCount: number }>) : [];

    const waitlistBase =
      results[6].status === "fulfilled" && results[6].value.length > 0
        ? results[6].value[0]
        : { totalWaiting: 0, avgWaitlistLength: 0 };

    const promotionRow =
      results[7].status === "fulfilled" && results[7].value.length > 0
        ? results[7].value[0]
        : { promotionCount: 0 };

    const waitlistStats = {
      totalWaiting: Number(waitlistBase.totalWaiting || 0),
      avgWaitlistLength: Math.round(Number(waitlistBase.avgWaitlistLength || 0) * 10) / 10,
      promotionCount: Number(promotionRow.promotionCount || 0),
    };

    return NextResponse.json(
      {
        mostBookedFacilities,
        peakHours,
        usageTrend,
        totalStats,
        topUsers,
        waitlistStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

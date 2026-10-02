import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waitlist, facilities, bookings, penalties } from "@/lib/db/schema";
import { joinWaitlistSchema } from "@/lib/validations";
import { requireRole, FACULTY_OR_ABOVE, ALL_AUTHENTICATED } from "@/lib/permissions";
import { and, eq, gt, inArray, notInArray, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const authResult = await requireRole(ALL_AUTHENTICATED);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { searchParams } = new URL(req.url);
    const facilityIdParam = searchParams.get("facilityId");
    const dateParam = searchParams.get("date");

    const queryConditions = [];

    if (user.role === "ADMIN") {
      if (facilityIdParam) queryConditions.push(eq(waitlist.facilityId, facilityIdParam));
      if (dateParam) queryConditions.push(eq(waitlist.date, dateParam));
    } else {
      queryConditions.push(eq(waitlist.userId, user.id));
      if (facilityIdParam) queryConditions.push(eq(waitlist.facilityId, facilityIdParam));
      if (dateParam) queryConditions.push(eq(waitlist.date, dateParam));
    }

    const waitlistEntries = await db
      .select({
        id: waitlist.id,
        userId: waitlist.userId,
        facilityId: waitlist.facilityId,
        date: waitlist.date,
        slotStart: waitlist.slotStart,
        position: waitlist.position,
        createdAt: waitlist.createdAt,
        facility: {
          id: facilities.id,
          name: facilities.name,
          location: facilities.location,
          type: facilities.type,
        },
      })
      .from(waitlist)
      .leftJoin(facilities, eq(waitlist.facilityId, facilities.id))
      .where(queryConditions.length > 0 ? and(...queryConditions) : undefined)
      .orderBy(waitlist.position);

    return NextResponse.json(waitlistEntries, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/waitlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await requireRole(FACULTY_OR_ABOVE);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const body = await req.json();
    const validationResult = joinWaitlistSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { facilityId, date, slotStart } = validationResult.data;
    const now = new Date();
    const startDate = new Date(slotStart);

    // 1. Penalty check
    const activePenalties = await db
      .select()
      .from(penalties)
      .where(and(eq(penalties.userId, user.id), gt(penalties.restrictedUntil, now)))
      .limit(1);

    if (activePenalties.length > 0) {
      return NextResponse.json(
        {
          error: "Booking restricted",
          restrictedUntil: activePenalties[0].restrictedUntil,
        },
        { status: 403 }
      );
    }

    // 2. Facility exists + available check
    const [facility] = await db
      .select()
      .from(facilities)
      .where(eq(facilities.id, facilityId))
      .limit(1);

    if (!facility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    if (facility.status === "UNDER_MAINTENANCE" || facility.status === "UNAVAILABLE") {
      return NextResponse.json(
        { error: "Facility unavailable" },
        { status: 400 }
      );
    }

    // 3. Operating hours check
    const startHHMM = `${String(startDate.getUTCHours()).padStart(2, "0")}:${String(startDate.getUTCMinutes()).padStart(2, "0")}`;
    if (startHHMM < facility.openingTime || startHHMM >= facility.closingTime) {
      return NextResponse.json(
        { error: "Outside operating hours" },
        { status: 400 }
      );
    }

    // 4. Slot must actually be unavailable
    const activeBooking = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.facilityId, facilityId),
          eq(bookings.date, date),
          eq(bookings.slotStart, startDate),
          inArray(bookings.status, ["APPROVED", "PENDING"])
        )
      )
      .limit(1);

    if (activeBooking.length === 0) {
      return NextResponse.json(
        { error: "Slot is available, book directly" },
        { status: 400 }
      );
    }

    // 5. User not already on waitlist for this slot
    const existingWaitlist = await db
      .select({ id: waitlist.id })
      .from(waitlist)
      .where(
        and(
          eq(waitlist.facilityId, facilityId),
          eq(waitlist.date, date),
          eq(waitlist.slotStart, startDate),
          eq(waitlist.userId, user.id)
        )
      )
      .limit(1);

    if (existingWaitlist.length > 0) {
      return NextResponse.json(
        { error: "Already on waitlist" },
        { status: 409 }
      );
    }

    // 6. User has no active booking on this date (1-slot-per-day rule)
    const existingUserBooking = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, user.id),
          eq(bookings.date, date),
          notInArray(bookings.status, ["REJECTED", "CANCELLED"])
        )
      )
      .limit(1);

    if (existingUserBooking.length > 0) {
      return NextResponse.json(
        { error: "Daily booking limit reached" },
        { status: 409 }
      );
    }

    // 7. Compute position
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(waitlist)
      .where(
        and(
          eq(waitlist.facilityId, facilityId),
          eq(waitlist.date, date),
          eq(waitlist.slotStart, startDate)
        )
      );

    const position = Number(count) + 1;

    // 8. Insert waitlist entry
    const [newWaitlistEntry] = await db
      .insert(waitlist)
      .values({
        userId: user.id,
        facilityId,
        date,
        slotStart: startDate,
        position,
      })
      .returning();

    return NextResponse.json(
      {
        position: newWaitlistEntry.position,
        entry: newWaitlistEntry,
        message: `Joined waitlist at position #${newWaitlistEntry.position}`,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === "23505" || String(err?.message).includes("unique constraint")) {
      return NextResponse.json({ error: "Already on waitlist" }, { status: 409 });
    }
    console.error("Error in POST /api/waitlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

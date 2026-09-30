import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facilities, bookings, penalties, users } from "@/lib/db/schema";
import { createBookingSchema } from "@/lib/validations";
import { requireRole, FACULTY_OR_ABOVE, ALL_AUTHENTICATED } from "@/lib/permissions";
import { sendEmail } from "@/lib/email/send";
import { and, eq, gt, inArray, notInArray } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const authResult = await requireRole(ALL_AUTHENTICATED);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const facilityIdParam = searchParams.get("facilityId");
    const dateParam = searchParams.get("date");

    const queryConditions = [];

    if (user.role === "ADMIN") {
      if (statusParam) queryConditions.push(eq(bookings.status, statusParam as any));
      if (facilityIdParam) queryConditions.push(eq(bookings.facilityId, facilityIdParam));
      if (dateParam) queryConditions.push(eq(bookings.date, dateParam));
    } else {
      queryConditions.push(eq(bookings.userId, user.id));
      if (statusParam) queryConditions.push(eq(bookings.status, statusParam as any));
    }

    const bookingList = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        facilityId: bookings.facilityId,
        date: bookings.date,
        slotStart: bookings.slotStart,
        slotEnd: bookings.slotEnd,
        status: bookings.status,
        rejectionReason: bookings.rejectionReason,
        cancelReason: bookings.cancelReason,
        createdAt: bookings.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        facility: {
          id: facilities.id,
          name: facilities.name,
          location: facilities.location,
          type: facilities.type,
        },
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(facilities, eq(bookings.facilityId, facilities.id))
      .where(queryConditions.length > 0 ? and(...queryConditions) : undefined)
      .orderBy(bookings.createdAt);

    return NextResponse.json(bookingList, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/bookings:", error);
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
    const validationResult = createBookingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { facilityId, date, slotStart, slotEnd } = validationResult.data;
    const now = new Date();

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
    const startDate = new Date(slotStart);
    const endDate = new Date(slotEnd);

    const startHHMM = `${String(startDate.getUTCHours()).padStart(2, "0")}:${String(startDate.getUTCMinutes()).padStart(2, "0")}`;
    const endHHMM = `${String(endDate.getUTCHours()).padStart(2, "0")}:${String(endDate.getUTCMinutes()).padStart(2, "0")}`;

    if (startHHMM < facility.openingTime || endHHMM > facility.closingTime) {
      return NextResponse.json(
        { error: "Outside operating hours" },
        { status: 400 }
      );
    }

    // 4. 1-slot-per-user-per-day check
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

    // 5. Overlap check (application layer)
    const existingSlotBooking = await db
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

    if (existingSlotBooking.length > 0) {
      return NextResponse.json(
        { error: "Slot unavailable" },
        { status: 409 }
      );
    }

    // 6. DB Transaction insert with unique constraint safety net
    try {
      const result = await db.transaction(async (tx) => {
        const [newBooking] = await tx
          .insert(bookings)
          .values({
            userId: user.id,
            facilityId,
            date,
            slotStart: startDate,
            slotEnd: endDate,
            status: "PENDING",
          })
          .returning();
        return newBooking;
      });

      // Trigger BOOKING_CONFIRMED email
      await sendEmail({
        type: "BOOKING_CONFIRMED",
        to: user.email || "",
        props: {
          userName: user.name || "User",
          facilityName: facility.name,
          date,
          slotStart: startDate.toISOString(),
          slotEnd: endDate.toISOString(),
          bookingId: result.id,
        },
      });

      return NextResponse.json(result, { status: 201 });
    } catch (dbError: unknown) {
      const err = dbError as { code?: string; message?: string };
      if (
        err?.code === "23505" ||
        String(err?.message).includes("unique constraint") ||
        String(err?.message).includes("booking_overlap_idx")
      ) {
        return NextResponse.json(
          { error: "Slot just taken" },
          { status: 409 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error in POST /api/bookings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

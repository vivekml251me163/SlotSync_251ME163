import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facilities, bookings } from "@/lib/db/schema";
import { requireRole, ALL_AUTHENTICATED } from "@/lib/permissions";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import { getISTDateString, getISTTimeHHMM } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const authResult = await requireRole(ALL_AUTHENTICATED);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { searchParams } = new URL(req.url);
    const facilityId = searchParams.get("facilityId");
    const dateParam = searchParams.get("date");

    if (!facilityId || !dateParam) {
      return NextResponse.json(
        { error: "facilityId and date query parameters are required" },
        { status: 400 }
      );
    }

    // Check past date in IST
    const todayStr = getISTDateString();
    if (dateParam < todayStr) {
      return NextResponse.json(
        { error: "Cannot check availability for past dates" },
        { status: 400 }
      );
    }

    // Fetch facility
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
        { error: `Facility is currently ${facility.status.toLowerCase().replace("_", " ")}` },
        { status: 400 }
      );
    }

    // Parse opening and closing times (HH:MM)
    const [openH, openM] = facility.openingTime.split(":").map(Number);
    const [closeH, closeM] = facility.closingTime.split(":").map(Number);

    // Query existing active bookings for this facility & date
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.facilityId, facilityId),
          eq(bookings.date, dateParam),
          inArray(bookings.status, ["APPROVED", "PENDING"])
        )
      );

    // Query user's booking status for today
    const userBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, user.id),
          eq(bookings.date, dateParam),
          notInArray(bookings.status, ["REJECTED", "CANCELLED"])
        )
      )
      .limit(1);

    const userBookingToday = userBookings.length > 0;

    // Generate 1-hour slots
    const slots: Array<{
      slotStart: string;
      slotEnd: string;
      status: "available" | "booked" | "pending";
    }> = [];

    const startTotalMinutes = openH * 60 + openM;
    const endTotalMinutes = closeH * 60 + closeM;

    for (let min = startTotalMinutes; min + 60 <= endTotalMinutes; min += 60) {
      const hStart = Math.floor(min / 60);
      const mStart = min % 60;
      const hEnd = Math.floor((min + 60) / 60);
      const mEnd = (min + 60) % 60;

      const slotStartStr = `${dateParam}T${String(hStart).padStart(2, "0")}:${String(mStart).padStart(2, "0")}:00+05:30`;
      const slotEndStr = `${dateParam}T${String(hEnd).padStart(2, "0")}:${String(mEnd).padStart(2, "0")}:00+05:30`;
      const slotStartDate = new Date(slotStartStr);
      const slotEndDate = new Date(slotEndStr);
      const slotStartISO = slotStartDate.toISOString();
      const slotEndISO = slotEndDate.toISOString();

      const startHHMMStr = `${String(hStart).padStart(2, "0")}:${String(mStart).padStart(2, "0")}`;

      // Check if matches existing booking
      const matchedBooking = existingBookings.find((b) => {
        const bDate = new Date(b.slotStart);
        return (
          bDate.getTime() === slotStartDate.getTime() ||
          (getISTDateString(bDate) === dateParam && getISTTimeHHMM(bDate) === startHHMMStr)
        );
      });

      let status: "available" | "booked" | "pending" = "available";
      if (matchedBooking) {
        status = matchedBooking.status === "APPROVED" ? "booked" : "pending";
      }

      slots.push({
        slotStart: slotStartISO,
        slotEnd: slotEndISO,
        status,
      });
    }

    return NextResponse.json(
      {
        slots,
        facilityStatus: facility.status,
        userBookingToday,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/availability:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, facilities, users } from "@/lib/db/schema";
import { updateBookingSchema } from "@/lib/validations";
import { requireRole, ALL_AUTHENTICATED } from "@/lib/permissions";
import { promoteFromWaitlist } from "@/lib/waitlist";
import { and, eq, sql } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(ALL_AUTHENTICATED);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;
    const { id } = await params;

    const [booking] = await db
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
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/bookings/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(ALL_AUTHENTICATED);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;
    const { id } = await params;

    const body = await req.json();
    const validationResult = updateBookingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const payload = validationResult.data;

    // Fetch existing booking
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    switch (payload.action) {
      case "REQUEST_CANCELLATION": {
        if (booking.userId !== user.id && user.role !== "ADMIN") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        if (booking.status !== "APPROVED") {
          return NextResponse.json(
            { error: "Invalid status transition", current: booking.status },
            { status: 400 }
          );
        }

        const [updated] = await db
          .update(bookings)
          .set({
            status: "CANCELLATION_REQUESTED",
            cancelReason: payload.cancelReason,
          })
          .where(eq(bookings.id, id))
          .returning();

        return NextResponse.json(updated, { status: 200 });
      }

      case "CANCEL": {
        if (booking.userId !== user.id && user.role !== "ADMIN") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        if (booking.status !== "PENDING") {
          return NextResponse.json(
            { error: "Invalid status transition", current: booking.status },
            { status: 400 }
          );
        }

        const [updated] = await db
          .update(bookings)
          .set({ status: "CANCELLED" })
          .where(eq(bookings.id, id))
          .returning();

        await promoteFromWaitlist(booking.facilityId, booking.date, booking.slotStart);

        return NextResponse.json(updated, { status: 200 });
      }

      case "APPROVE": {
        if (user.role !== "ADMIN") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        if (booking.status !== "PENDING") {
          return NextResponse.json(
            { error: "Invalid status transition", current: booking.status },
            { status: 400 }
          );
        }

        const result = await db.transaction(async (tx) => {
          // SELECT FOR UPDATE on booking row using raw SQL
          await tx.execute(sql`SELECT id FROM bookings WHERE id = ${id} FOR UPDATE`);

          // Re-fetch booking inside transaction to check latest status
          const [currentBooking] = await tx
            .select()
            .from(bookings)
            .where(eq(bookings.id, id))
            .limit(1);

          if (!currentBooking || currentBooking.status !== "PENDING") {
            return { error: "Booking already processed", status: 409 };
          }

          // Check for any other APPROVED booking with same facilityId + date + slotStart
          const [conflict] = await tx
            .select()
            .from(bookings)
            .where(
              and(
                eq(bookings.facilityId, currentBooking.facilityId),
                eq(bookings.date, currentBooking.date),
                eq(bookings.slotStart, currentBooking.slotStart),
                eq(bookings.status, "APPROVED")
              )
            )
            .limit(1);

          if (conflict) {
            return { error: "Slot unavailable", status: 409 };
          }

          const [updated] = await tx
            .update(bookings)
            .set({ status: "APPROVED" })
            .where(eq(bookings.id, id))
            .returning();

          return { updated };
        });

        if ("error" in result) {
          return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.updated, { status: 200 });
      }

      case "REJECT": {
        if (user.role !== "ADMIN") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        if (booking.status !== "PENDING") {
          return NextResponse.json(
            { error: "Invalid status transition", current: booking.status },
            { status: 400 }
          );
        }

        const [updated] = await db
          .update(bookings)
          .set({
            status: "REJECTED",
            rejectionReason: payload.rejectionReason,
          })
          .where(eq(bookings.id, id))
          .returning();

        return NextResponse.json(updated, { status: 200 });
      }

      case "APPROVE_CANCELLATION": {
        if (user.role !== "ADMIN") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        if (booking.status !== "CANCELLATION_REQUESTED") {
          return NextResponse.json(
            { error: "Invalid status transition", current: booking.status },
            { status: 400 }
          );
        }

        const [updated] = await db
          .update(bookings)
          .set({ status: "CANCELLED" })
          .where(eq(bookings.id, id))
          .returning();

        await promoteFromWaitlist(booking.facilityId, booking.date, booking.slotStart);

        return NextResponse.json(updated, { status: 200 });
      }

      case "REJECT_CANCELLATION": {
        if (user.role !== "ADMIN") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        if (booking.status !== "CANCELLATION_REQUESTED") {
          return NextResponse.json(
            { error: "Invalid status transition", current: booking.status },
            { status: 400 }
          );
        }

        const [updated] = await db
          .update(bookings)
          .set({ status: "APPROVED" })
          .where(eq(bookings.id, id))
          .returning();

        return NextResponse.json(updated, { status: 200 });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in PATCH /api/bookings/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

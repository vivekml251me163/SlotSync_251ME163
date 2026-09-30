import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facilities, bookings } from "@/lib/db/schema";
import { updateFacilitySchema } from "@/lib/validations";
import { requireRole, ADMIN, ALL_AUTHENTICATED } from "@/lib/permissions";
import { and, eq, gt, inArray } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(ALL_AUTHENTICATED);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;

    const [facility] = await db
      .select()
      .from(facilities)
      .where(eq(facilities.id, id))
      .limit(1);

    if (!facility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    return NextResponse.json(facility, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/facilities/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(ADMIN);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;

    const [existingFacility] = await db
      .select()
      .from(facilities)
      .where(eq(facilities.id, id))
      .limit(1);

    if (!existingFacility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    const body = await req.json();
    const validationResult = updateFacilitySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Check status change constraints
    if (
      updateData.status &&
      (updateData.status === "UNDER_MAINTENANCE" || updateData.status === "UNAVAILABLE")
    ) {
      const now = new Date();
      const activeBookings = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.facilityId, id),
            eq(bookings.status, "APPROVED"),
            gt(bookings.slotStart, now)
          )
        );

      if (activeBookings.length > 0) {
        return NextResponse.json(
          { error: "Active bookings exist", count: activeBookings.length },
          { status: 409 }
        );
      }
    }

    // Check name uniqueness if name is modified
    if (updateData.name && updateData.name !== existingFacility.name) {
      const nameConflict = await db
        .select({ id: facilities.id })
        .from(facilities)
        .where(eq(facilities.name, updateData.name))
        .limit(1);

      if (nameConflict.length > 0) {
        return NextResponse.json(
          { error: "Facility name already exists" },
          { status: 409 }
        );
      }
    }

    const [updatedFacility] = await db
      .update(facilities)
      .set(updateData)
      .where(eq(facilities.id, id))
      .returning();

    return NextResponse.json(updatedFacility, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/facilities/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(ADMIN);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;

    const [existingFacility] = await db
      .select({ id: facilities.id })
      .from(facilities)
      .where(eq(facilities.id, id))
      .limit(1);

    if (!existingFacility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    // Soft-check active or pending bookings
    const activeBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.facilityId, id),
          inArray(bookings.status, ["APPROVED", "PENDING"])
        )
      )
      .limit(1);

    if (activeBookings.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete facility with active bookings" },
        { status: 409 }
      );
    }

    await db.delete(facilities).where(eq(facilities.id, id));

    return NextResponse.json({ message: "Facility deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/facilities/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

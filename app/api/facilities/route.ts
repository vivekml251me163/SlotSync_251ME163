import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facilities } from "@/lib/db/schema";
import { createFacilitySchema } from "@/lib/validations";
import { requireRole, ADMIN, ALL_AUTHENTICATED } from "@/lib/permissions";
import { and, eq, gte, ilike } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const authResult = await requireRole(ALL_AUTHENTICATED);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type");
    const minCapacityParam = searchParams.get("minCapacity");

    const conditions = [];

    if (typeParam) {
      conditions.push(ilike(facilities.type, typeParam));
    }

    if (minCapacityParam) {
      const minCapacity = parseInt(minCapacityParam, 10);
      if (!isNaN(minCapacity)) {
        conditions.push(gte(facilities.capacity, minCapacity));
      }
    }

    const facilityList = await db
      .select()
      .from(facilities)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json(facilityList, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/facilities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await requireRole(ADMIN);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await req.json();
    const validationResult = createFacilitySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, type, location, capacity, openingTime, closingTime } = validationResult.data;

    // Check duplicate facility name
    const existing = await db
      .select({ id: facilities.id })
      .from(facilities)
      .where(eq(facilities.name, name))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Facility name already exists" },
        { status: 409 }
      );
    }

    const [newFacility] = await db
      .insert(facilities)
      .values({
        name,
        type,
        location,
        capacity,
        openingTime,
        closingTime,
      })
      .returning();

    return NextResponse.json(newFacility, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/facilities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

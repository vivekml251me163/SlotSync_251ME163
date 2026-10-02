import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waitlist } from "@/lib/db/schema";
import { requireRole, FACULTY_OR_ABOVE } from "@/lib/permissions";
import { eq, sql } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(FACULTY_OR_ABOVE);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { id } = await params;

    // 1. Fetch waitlist entry
    const [entry] = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.id, id))
      .limit(1);

    if (!entry) {
      return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 });
    }

    // 2. Own entry check (403 if entry.userId !== user.id and not ADMIN)
    if (entry.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not your waitlist entry" }, { status: 403 });
    }

    const { facilityId, date, slotStart } = entry;

    // 3. Delete entry and re-sequence remaining positions
    await db.transaction(async (tx) => {
      await tx.delete(waitlist).where(eq(waitlist.id, id));

      await tx.execute(sql`
        UPDATE waitlist SET position = sub.rn
        FROM (
          SELECT id, ROW_NUMBER() OVER (ORDER BY "created_at" ASC) as rn
          FROM waitlist
          WHERE "facility_id" = ${facilityId} AND date = ${date} AND "slot_start" = ${slotStart}
        ) sub
        WHERE waitlist.id = sub.id
      `);
    });

    return NextResponse.json({ message: "Left waitlist successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/waitlist/[id]:", error);
    return NextResponse.json(
      { error: "Failed to leave waitlist" },
      { status: 500 }
    );
  }
}

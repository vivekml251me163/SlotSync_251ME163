import { db as defaultDb } from "@/lib/db";
import { bookings, waitlist } from "@/lib/db/schema";
import { and, eq, asc } from "drizzle-orm";

export async function promoteFromWaitlist(
  facilityId: string,
  date: string,
  slotStart: Date,
  db = defaultDb
): Promise<string | null> {
  try {
    // 1. Find lowest-position waitlist entry for this slot
    const [topWaitlist] = await db
      .select()
      .from(waitlist)
      .where(
        and(
          eq(waitlist.facilityId, facilityId),
          eq(waitlist.date, date),
          eq(waitlist.slotStart, slotStart)
        )
      )
      .orderBy(asc(waitlist.position))
      .limit(1);

    if (!topWaitlist) {
      return null;
    }

    // 3. Inside db.transaction()
    const promotedUserId = await db.transaction(async (tx) => {
      // a. Delete top waitlist entry
      await tx.delete(waitlist).where(eq(waitlist.id, topWaitlist.id));

      const slotEnd = new Date(slotStart.getTime() + 3600000);

      // b. Insert new APPROVED booking
      await tx.insert(bookings).values({
        userId: topWaitlist.userId,
        facilityId,
        date,
        slotStart,
        slotEnd,
        status: "APPROVED",
      });

      return topWaitlist.userId;
    });

    return promotedUserId;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (
      err?.code === "23505" ||
      String(err?.message).includes("unique constraint") ||
      String(err?.message).includes("booking_overlap_idx")
    ) {
      // Silent abort on 23505
      return null;
    }
    console.error("Error promoting from waitlist:", error);
    return null;
  }
}

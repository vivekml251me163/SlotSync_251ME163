import { db as defaultDb } from "@/lib/db";
import { bookings, waitlist, users, facilities } from "@/lib/db/schema";
import { and, eq, asc, sql } from "drizzle-orm";

export interface PromotionResult {
  promotedUserId: string;
  userEmail: string;
  userName: string;
  facilityName: string;
  facilityLocation: string;
  date: string;
  slotStart: Date;
  slotEnd: Date;
  bookingId: string;
}

export async function promoteFromWaitlist(
  facilityId: string,
  date: string,
  slotStart: Date,
  db = defaultDb
): Promise<PromotionResult | null> {
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

    const slotEnd = new Date(slotStart.getTime() + 3600000);

    // 3. Inside db.transaction()
    const promotionData = await db.transaction(async (tx) => {
      // a. Delete top waitlist entry
      await tx.delete(waitlist).where(eq(waitlist.id, topWaitlist.id));

      // b. Insert new APPROVED booking for that user
      const [newBooking] = await tx
        .insert(bookings)
        .values({
          userId: topWaitlist.userId,
          facilityId,
          date,
          slotStart,
          slotEnd,
          status: "APPROVED",
          promotedFromWaitlist: true,
        })
        .returning();

      // c. Re-sequence remaining waitlist positions
      await tx.execute(sql`
        UPDATE waitlist SET position = sub.rn
        FROM (
          SELECT id, ROW_NUMBER() OVER (ORDER BY "created_at" ASC) as rn
          FROM waitlist
          WHERE "facility_id" = ${facilityId} AND date = ${date} AND "slot_start" = ${slotStart.toISOString()}
        ) sub
        WHERE waitlist.id = sub.id
      `);

      return { newBooking, userId: topWaitlist.userId };
    });

    if (promotionData?.newBooking) {
      const [user] = await db.select().from(users).where(eq(users.id, promotionData.userId)).limit(1);
      const [facility] = await db.select().from(facilities).where(eq(facilities.id, facilityId)).limit(1);

      if (user && facility) {
        return {
          promotedUserId: user.id,
          userEmail: user.email,
          userName: user.name,
          facilityName: facility.name,
          facilityLocation: facility.location,
          date,
          slotStart,
          slotEnd,
          bookingId: promotionData.newBooking.id,
        };
      }
    }

    return null;
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

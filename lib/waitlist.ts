import { db as defaultDb } from "@/lib/db";
import { bookings, waitlist, users, facilities } from "@/lib/db/schema";
import { and, eq, asc } from "drizzle-orm";
import { inngest } from "@/lib/inngest/client";
import { sendEmail } from "@/lib/email/send";

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

    if (promotedUserId) {
      // Fetch promoted user details & facility details for notifications
      const [user] = await db.select().from(users).where(eq(users.id, promotedUserId)).limit(1);
      const [facility] = await db.select().from(facilities).where(eq(facilities.id, facilityId)).limit(1);

      if (user && facility) {
        const slotEnd = new Date(slotStart.getTime() + 3600000);
        const eventData = {
          userEmail: user.email,
          userName: user.name,
          facilityName: facility.name,
          date,
          slotStart: slotStart.toISOString(),
          slotEnd: slotEnd.toISOString(),
        };

        await inngest.send({
          name: "waitlist/promoted",
          data: eventData,
        });

        await sendEmail({
          type: "WAITLIST_PROMOTED",
          to: user.email,
          props: eventData,
        });
      }
    }

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

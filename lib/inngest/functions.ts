import { inngest } from "./client";
import { sendEmail } from "@/lib/email/send";
import { db } from "@/lib/db";
import { bookings, penalties, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const sendSlotReminder = inngest.createFunction(
  {
    id: "send-slot-reminder",
    cancelOn: [{ event: "booking/cancelled", match: "data.bookingId" }],
    triggers: [{ event: "booking/approved" }],
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { bookingId, slotStart, userEmail, userName, facilityName, facilityLocation, date } = event.data;
    const reminderTime = new Date(new Date(slotStart).getTime() - 30 * 60 * 1000);

    await step.sleepUntil("wait-until-reminder", reminderTime);

    await step.run("send-reminder-email", async () => {
      await sendEmail({
        type: "SLOT_REMINDER",
        to: userEmail,
        props: {
          userName,
          facilityName,
          date,
          slotStart,
          location: facilityLocation,
        },
      });
    });
  }
);

export const promoteWaitlistNotifier = inngest.createFunction(
  {
    id: "waitlist-promoted-notifier",
    triggers: [{ event: "waitlist/promoted" }],
  },
  async ({ event, step }: { event: any; step: any }) => {
    await step.run("send-promotion-email", async () => {
      await sendEmail({
        type: "WAITLIST_PROMOTED",
        to: event.data.userEmail,
        props: {
          userName: event.data.userName,
          facilityName: event.data.facilityName,
          date: event.data.date,
          slotStart: event.data.slotStart,
          slotEnd: event.data.slotEnd,
        },
      });
    });
  }
);

export const detectNoShow = inngest.createFunction(
  {
    id: "detect-no-show",
    triggers: [{ event: "booking/approved" }],
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { bookingId, slotEnd } = event.data;

    await step.sleepUntil("wait-until-slot-end", new Date(slotEnd));

    await step.run("check-no-show", async () => {
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!booking || booking.status !== "APPROVED") return;

      const restrictedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.insert(penalties).values({
        userId: booking.userId,
        restrictedUntil,
        reason: `No-show for booking ${bookingId}`,
      });

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, booking.userId))
        .limit(1);

      if (user) {
        await sendEmail({
          type: "PENALTY_APPLIED",
          to: user.email,
          props: {
            userName: user.name,
            restrictedUntil: restrictedUntil.toISOString(),
          },
        });
      }
    });
  }
);

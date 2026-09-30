import { inngest } from "./client";
import { sendEmail } from "@/lib/email/send";

export const sendSlotReminder = (inngest.createFunction as any)(
  {
    id: "send-slot-reminder",
    cancelOn: [{ event: "booking/cancelled", match: "data.bookingId" }],
  },
  { event: "booking/approved" },
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

export const promoteWaitlistNotifier = (inngest.createFunction as any)(
  { id: "waitlist-promoted-notifier" },
  { event: "waitlist/promoted" },
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

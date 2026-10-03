import { resend } from "./index";
import { render } from "@react-email/render";
import React from "react";
import BookingConfirmation, { BookingConfirmationProps } from "./templates/BookingConfirmation";
import BookingApproved, { BookingApprovedProps } from "./templates/BookingApproved";
import BookingRejected, { BookingRejectedProps } from "./templates/BookingRejected";
import BookingCancelled, { BookingCancelledProps } from "./templates/BookingCancelled";
import SlotReminder, { SlotReminderProps } from "./templates/SlotReminder";
import WaitlistPromoted, { WaitlistPromotedProps } from "./templates/WaitlistPromoted";
import PenaltyApplied, { PenaltyAppliedProps } from "./templates/PenaltyApplied";

export type EmailPayload =
  | { type: "BOOKING_CONFIRMED"; to: string; props: BookingConfirmationProps }
  | { type: "BOOKING_APPROVED"; to: string; props: BookingApprovedProps }
  | { type: "BOOKING_REJECTED"; to: string; props: BookingRejectedProps }
  | { type: "BOOKING_CANCELLED"; to: string; props: BookingCancelledProps }
  | { type: "SLOT_REMINDER"; to: string; props: SlotReminderProps }
  | { type: "WAITLIST_PROMOTED"; to: string; props: WaitlistPromotedProps }
  | { type: "PENALTY_APPLIED"; to: string; props: PenaltyAppliedProps };

export async function sendEmail(payload: EmailPayload): Promise<void> {
  try {
    let subject = "";
    let component: React.ReactElement;

    switch (payload.type) {
      case "BOOKING_CONFIRMED":
        subject = "SlotSync - Booking Request Received";
        component = React.createElement(BookingConfirmation, payload.props);
        break;
      case "BOOKING_APPROVED":
        subject = "SlotSync - Booking Approved!";
        component = React.createElement(BookingApproved, payload.props);
        break;
      case "BOOKING_REJECTED":
        subject = "SlotSync - Booking Request Update";
        component = React.createElement(BookingRejected, payload.props);
        break;
      case "BOOKING_CANCELLED":
        subject = "SlotSync - Booking Cancelled";
        component = React.createElement(BookingCancelled, payload.props);
        break;
      case "SLOT_REMINDER":
        subject = "SlotSync - Slot Reminder (30 mins)";
        component = React.createElement(SlotReminder, payload.props);
        break;
      case "WAITLIST_PROMOTED":
        subject = "SlotSync - Promoted from Waitlist!";
        component = React.createElement(WaitlistPromoted, payload.props);
        break;
      case "PENALTY_APPLIED":
        subject = "SlotSync - Booking Restriction Notice";
        component = React.createElement(PenaltyApplied, payload.props);
        break;
    }

    const html = await render(component);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: payload.to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Failed to send email [type: ${payload.type}] to ${payload.to}:`, error);
  }
}

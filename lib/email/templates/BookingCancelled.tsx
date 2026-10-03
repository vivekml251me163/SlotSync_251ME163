import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from "@react-email/components";
import { formatDate, formatTime } from "@/lib/utils";

export interface BookingCancelledProps {
  userName: string;
  facilityName: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  cancelReason?: string;
}

export function BookingCancelled({
  userName,
  facilityName,
  date,
  slotStart,
  slotEnd,
  cancelReason,
}: BookingCancelledProps) {
  return (
    <Html>
      <Head />
      <Preview>Booking Cancelled - SlotSync</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif", padding: "20px" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "40px", maxWidth: "600px" }}>
          <Heading style={{ color: "#744210", fontSize: "24px", marginBottom: "16px" }}>
            Booking Cancelled
          </Heading>
          <Text style={{ color: "#4a5568", fontSize: "16px", lineHeight: "24px" }}>
            Hello {userName},
          </Text>
          <Text style={{ color: "#4a5568", fontSize: "16px", lineHeight: "24px" }}>
            Your booking for <strong>{facilityName}</strong> on {formatDate(date)} ({formatTime(slotStart)} - {formatTime(slotEnd)}) has been cancelled.
          </Text>
          {cancelReason && (
            <>
              <Hr style={{ borderColor: "#e2e8f0", margin: "20px 0" }} />
              <Section style={{ backgroundColor: "#fffff0", borderRadius: "6px", padding: "16px" }}>
                <Text style={{ margin: "4px 0", color: "#975a16" }}><strong>Cancellation Reason:</strong> {cancelReason}</Text>
              </Section>
            </>
          )}
          <Text style={{ color: "#718096", fontSize: "14px", marginTop: "24px" }}>
            This slot has now been made available to other users or promoted waitlist applicants.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default BookingCancelled;

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

export interface BookingRejectedProps {
  userName: string;
  facilityName: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  rejectionReason: string;
}

export function BookingRejected({
  userName,
  facilityName,
  date,
  slotStart,
  slotEnd,
  rejectionReason,
}: BookingRejectedProps) {
  return (
    <Html>
      <Head />
      <Preview>Booking Request Update - SlotSync</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif", padding: "20px" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "40px", maxWidth: "600px" }}>
          <Heading style={{ color: "#c53030", fontSize: "24px", marginBottom: "16px" }}>
            Booking Request Not Approved
          </Heading>
          <Text style={{ color: "#4a5568", fontSize: "16px", lineHeight: "24px" }}>
            Hello {userName},
          </Text>
          <Text style={{ color: "#4a5568", fontSize: "16px", lineHeight: "24px" }}>
            Unfortunately, your booking request for <strong>{facilityName}</strong> on {date} ({slotStart} - {slotEnd}) was rejected by an administrator.
          </Text>
          <Hr style={{ borderColor: "#e2e8f0", margin: "20px 0" }} />
          <Section style={{ backgroundColor: "#fff5f5", borderRadius: "6px", padding: "16px" }}>
            <Text style={{ margin: "4px 0", color: "#9b2c2c" }}><strong>Reason:</strong> {rejectionReason}</Text>
          </Section>
          <Text style={{ color: "#718096", fontSize: "14px", marginTop: "24px" }}>
            Feel free to select a different slot or contact support for further clarification.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default BookingRejected;

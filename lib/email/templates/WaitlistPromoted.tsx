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

export interface WaitlistPromotedProps {
  userName: string;
  facilityName: string;
  date: string;
  slotStart: string;
  slotEnd: string;
}

export function WaitlistPromoted({
  userName,
  facilityName,
  date,
  slotStart,
  slotEnd,
}: WaitlistPromotedProps) {
  return (
    <Html>
      <Head />
      <Preview>Promoted from Waitlist! - SlotSync</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif", padding: "20px" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "40px", maxWidth: "600px" }}>
          <Heading style={{ color: "#276749", fontSize: "24px", marginBottom: "16px" }}>
            Promoted from Waitlist!
          </Heading>
          <Text style={{ color: "#4a5568", fontSize: "16px", lineHeight: "24px" }}>
            Hello {userName},
          </Text>
          <Text style={{ color: "#4a5568", fontSize: "16px", lineHeight: "24px" }}>
            Good news! You have been moved from the waitlist to a confirmed booking for <strong>{facilityName}</strong>.
          </Text>
          <Hr style={{ borderColor: "#e2e8f0", margin: "20px 0" }} />
          <Section style={{ backgroundColor: "#f0fff4", borderRadius: "6px", padding: "16px" }}>
            <Text style={{ margin: "4px 0", color: "#22543d" }}><strong>Facility:</strong> {facilityName}</Text>
            <Text style={{ margin: "4px 0", color: "#22543d" }}><strong>Date:</strong> {date}</Text>
            <Text style={{ margin: "4px 0", color: "#22543d" }}><strong>Time:</strong> {slotStart} - {slotEnd}</Text>
            <Text style={{ margin: "4px 0", color: "#22543d" }}><strong>Status:</strong> CONFIRMED</Text>
          </Section>
          <Text style={{ color: "#718096", fontSize: "14px", marginTop: "24px" }}>
            Your booking is automatically confirmed. No further action is required.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WaitlistPromoted;

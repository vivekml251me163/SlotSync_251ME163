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

export interface SlotReminderProps {
  userName: string;
  facilityName: string;
  date: string;
  slotStart: string;
  location: string;
}

export function SlotReminder({
  userName,
  facilityName,
  date,
  slotStart,
  location,
}: SlotReminderProps) {
  return (
    <Html>
      <Head />
      <Preview>Upcoming Slot Reminder - Starts in 30 minutes!</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif", padding: "20px" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "40px", maxWidth: "600px" }}>
          <Heading style={{ color: "#2b6cb0", fontSize: "24px", marginBottom: "16px" }}>
            Slot Starts in 30 Minutes
          </Heading>
          <Text style={{ color: "#4a5568", fontSize: "16px", lineHeight: "24px" }}>
            Hello {userName},
          </Text>
          <Text style={{ color: "#4a5568", fontSize: "16px", lineHeight: "24px" }}>
            This is a friendly reminder that your booking for <strong>{facilityName}</strong> is starting shortly!
          </Text>
          <Hr style={{ borderColor: "#e2e8f0", margin: "20px 0" }} />
          <Section style={{ backgroundColor: "#ebf8ff", borderRadius: "6px", padding: "16px" }}>
            <Text style={{ margin: "4px 0", color: "#2c5282" }}><strong>Facility:</strong> {facilityName}</Text>
            <Text style={{ margin: "4px 0", color: "#2c5282" }}><strong>Location:</strong> {location}</Text>
            <Text style={{ margin: "4px 0", color: "#2c5282" }}><strong>Date:</strong> {formatDate(date)}</Text>
            <Text style={{ margin: "4px 0", color: "#2c5282" }}><strong>Start Time:</strong> {formatTime(slotStart)}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default SlotReminder;

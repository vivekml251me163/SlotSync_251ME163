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

export interface BookingConfirmationProps {
  userName: string;
  facilityName: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  bookingId: string;
}

export function BookingConfirmation({
  userName,
  facilityName,
  date,
  slotStart,
  slotEnd,
  bookingId,
}: BookingConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Booking Request Received - SlotSync</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif", padding: "20px" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "40px", maxWidth: "600px" }}>
          <Heading style={{ color: "#1a202c", fontSize: "24px", marginBottom: "16px" }}>
            Booking Request Confirmation
          </Heading>
          <Text style={{ color: "#4a5568", fontSize: "16px", lineHeight: "24px" }}>
            Hello {userName},
          </Text>
          <Text style={{ color: "#4a5568", fontSize: "16px", lineHeight: "24px" }}>
            Your booking request for <strong>{facilityName}</strong> has been received and is currently pending admin approval.
          </Text>
          <Hr style={{ borderColor: "#e2e8f0", margin: "20px 0" }} />
          <Section style={{ backgroundColor: "#f7fafc", borderRadius: "6px", padding: "16px" }}>
            <Text style={{ margin: "4px 0", color: "#2d3748" }}><strong>Booking ID:</strong> {bookingId}</Text>
            <Text style={{ margin: "4px 0", color: "#2d3748" }}><strong>Facility:</strong> {facilityName}</Text>
            <Text style={{ margin: "4px 0", color: "#2d3748" }}><strong>Date:</strong> {formatDate(date)}</Text>
            <Text style={{ margin: "4px 0", color: "#2d3748" }}><strong>Time:</strong> {formatTime(slotStart)} - {formatTime(slotEnd)}</Text>
          </Section>
          <Text style={{ color: "#718096", fontSize: "14px", marginTop: "24px" }}>
            You will receive another notification once an administrator reviews your request.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default BookingConfirmation;

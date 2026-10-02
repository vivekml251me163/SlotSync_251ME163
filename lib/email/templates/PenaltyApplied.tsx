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

export interface PenaltyAppliedProps {
  userName: string;
  restrictedUntil: string;
}

export function PenaltyApplied({
  userName,
  restrictedUntil,
}: PenaltyAppliedProps) {
  const formattedRestrictedUntil = new Date(restrictedUntil).toLocaleString();

  return (
    <Html>
      <Head />
      <Preview>Booking Restriction Notice - SlotSync</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif", padding: "20px" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "40px", maxWidth: "600px" }}>
          <Heading style={{ color: "#c53030", fontSize: "24px", marginBottom: "16px" }}>
            Booking Restriction Notice
          </Heading>
          <Text style={{ color: "#4a5568", fontSize: "16px", lineHeight: "24px" }}>
            Hello {userName},
          </Text>
          <Text style={{ color: "#4a5568", fontSize: "16px", lineHeight: "24px" }}>
            You have been flagged as a no-show for a confirmed facility booking. As per SlotSync policy, your booking privileges have been temporarily restricted for 24 hours.
          </Text>
          <Hr style={{ borderColor: "#e2e8f0", margin: "20px 0" }} />
          <Section style={{ backgroundColor: "#fff5f5", borderRadius: "6px", padding: "16px" }}>
            <Text style={{ margin: "4px 0", color: "#9b2c2c" }}>
              <strong>Restriction End Time:</strong> {formattedRestrictedUntil}
            </Text>
          </Section>
          <Text style={{ color: "#718096", fontSize: "14px", marginTop: "24px" }}>
            You will be able to make new booking requests after the restriction period expires.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PenaltyApplied;

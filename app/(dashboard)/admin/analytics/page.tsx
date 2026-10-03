import { requireRole, ADMIN } from "@/lib/permissions";
import { NextResponse } from "next/server";
import React from "react";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const authResult = await requireRole(ADMIN);
  if (authResult instanceof NextResponse) {
    return authResult as unknown as React.ReactElement;
  }

  return <AnalyticsClient />;
}

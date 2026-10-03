import { requireRole, ALL_AUTHENTICATED } from "@/lib/permissions";
import { NextResponse } from "next/server";
import React from "react";
import StudentPageClient from "./StudentPageClient";

export const dynamic = "force-dynamic";

export default async function StudentPage() {
  const authResult = await requireRole(ALL_AUTHENTICATED);
  if (authResult instanceof NextResponse) {
    return authResult as unknown as React.ReactElement;
  }

  return <StudentPageClient />;
}

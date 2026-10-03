import { requireRole, ADMIN } from "@/lib/permissions";
import { NextResponse } from "next/server";
import AdminBookingsClient from "./BookingsClient";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const authResult = await requireRole(ADMIN);
  if (authResult instanceof NextResponse) {
    return authResult as unknown as React.ReactElement;
  }

  return <AdminBookingsClient />;
}

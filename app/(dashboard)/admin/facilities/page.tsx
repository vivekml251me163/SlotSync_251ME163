import { requireRole, ADMIN } from "@/lib/permissions";
import { NextResponse } from "next/server";
import AdminFacilitiesClient from "./FacilitiesClient";

export const dynamic = "force-dynamic";

export default async function AdminFacilitiesPage() {
  const authResult = await requireRole(ADMIN);
  if (authResult instanceof NextResponse) {
    return authResult as unknown as React.ReactElement;
  }

  return <AdminFacilitiesClient />;
}

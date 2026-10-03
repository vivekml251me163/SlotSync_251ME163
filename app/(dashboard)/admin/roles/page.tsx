import { requireRole, ADMIN } from "@/lib/permissions";
import { NextResponse } from "next/server";
import AdminRolesClient from "./RolesClient";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const authResult = await requireRole(ADMIN);
  if (authResult instanceof NextResponse) {
    return authResult as unknown as React.ReactElement;
  }
  const currentUser = authResult;

  return <AdminRolesClient currentUserId={currentUser.id} />;
}

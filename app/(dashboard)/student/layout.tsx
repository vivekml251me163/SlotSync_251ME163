import React from "react";
import { requireRole, ALL_AUTHENTICATED } from "@/lib/permissions";
import { NextResponse } from "next/server";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Search } from "lucide-react";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResult = await requireRole(ALL_AUTHENTICATED);
  if (authResult instanceof NextResponse) {
    return authResult as unknown as React.ReactElement;
  }

  const user = authResult;

  const studentNavItems = [
    { label: "Browse", href: "/student", icon: Search },
  ];

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <DashboardSidebar
        title="SlotSync"
        navItems={studentNavItems}
        userName={user.name}
        userRole={user.role}
        /* Student sidebar extras rendered via slot */
        studentMode
      />
      <main className="flex-1 overflow-auto p-6 bg-background">{children}</main>
    </div>
  );
}

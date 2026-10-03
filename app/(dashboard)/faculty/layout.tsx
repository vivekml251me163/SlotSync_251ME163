import React from "react";
import { requireRole, FACULTY_OR_ABOVE } from "@/lib/permissions";
import { NextResponse } from "next/server";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResult = await requireRole(FACULTY_OR_ABOVE);
  if (authResult instanceof NextResponse) {
    return authResult as unknown as React.ReactElement;
  }

  const user = authResult;

  const facultyNavItems = [
    { label: "Bookings", href: "/faculty/bookings", icon: "CalendarDays" },
  ];

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <DashboardSidebar
        title="SlotSync Faculty"
        navItems={facultyNavItems}
        userName={user.name}
        userRole={user.role}
      />
      <main className="flex-1 overflow-auto p-6 bg-background">{children}</main>
    </div>
  );
}

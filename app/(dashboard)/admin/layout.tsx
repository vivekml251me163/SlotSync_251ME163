import React from "react";
import { requireRole, ADMIN } from "@/lib/permissions";
import { NextResponse } from "next/server";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Building2, CalendarCheck, BarChart3, ShieldCheck } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResult = await requireRole(ADMIN);
  if (authResult instanceof NextResponse) {
    return authResult as unknown as React.ReactElement;
  }

  const user = authResult;

  const adminNavItems = [
    { label: "Facilities", href: "/admin/facilities", icon: Building2 },
    { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Roles", href: "/admin/roles", icon: ShieldCheck },
  ];

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <DashboardSidebar
        title="SlotSync Admin"
        navItems={adminNavItems}
        userName={user.name}
        userRole={user.role}
      />
      <main className="flex-1 overflow-auto p-6 bg-background">{children}</main>
    </div>
  );
}

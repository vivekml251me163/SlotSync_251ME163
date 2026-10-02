import React from "react";
import Link from "next/link";
import { requireRole, ADMIN } from "@/lib/permissions";
import { NextResponse } from "next/server";
import { Separator } from "@/components/ui/separator";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResult = await requireRole(ADMIN);
  if (authResult instanceof NextResponse) {
    return authResult as unknown as React.ReactElement;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white p-4 flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">SlotSync Admin</h2>
          <p className="text-xs text-gray-500">Administration Portal</p>
        </div>

        <Separator className="mb-4" />

        <nav className="flex-1 space-y-1">
          <Link
            href="/admin/facilities"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Facilities
          </Link>
          <Link
            href="/admin/bookings"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Bookings
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Analytics
          </Link>
          <Link
            href="/admin/roles"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Roles & RBAC
          </Link>
        </nav>

        <Separator className="my-4" />

        <div className="text-xs text-gray-400">
          LoggedIn User: {authResult.name} ({authResult.role})
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

import { db } from "@/lib/db";
import { facilities } from "@/lib/db/schema";
import { requireRole, ALL_AUTHENTICATED } from "@/lib/permissions";
import { NextResponse } from "next/server";
import React from "react";
import { ne, sql } from "drizzle-orm";
import { StudentBrowser } from "@/components/student/StudentBrowser";
import { Building2, LayoutGrid, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentPage() {
  const authResult = await requireRole(ALL_AUTHENTICATED);
  if (authResult instanceof NextResponse) {
    return authResult as unknown as React.ReactElement;
  }

  // Fetch only AVAILABLE facilities
  const facilityList = await db
    .select()
    .from(facilities)
    .where(ne(facilities.status, "UNDER_MAINTENANCE"))
    .orderBy(facilities.name);

  const availableFacilities = facilityList.filter((f) => f.status === "AVAILABLE");

  // Compute stat strip server-side
  const totalAvailable = availableFacilities.length;
  const uniqueTypes = new Set(availableFacilities.map((f) => f.type)).size;
  const totalCapacity = availableFacilities.reduce((sum, f) => sum + f.capacity, 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Browse Facilities
        </h1>
        <p className="text-sm text-muted-foreground">
          View real-time slot availability across campus.
        </p>
      </div>

      {/* Stat Strip */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-foreground leading-none">
              {totalAvailable}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Facilities Available</p>
          </div>
        </div>

        <div className="w-px h-8 self-center bg-border" />

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-foreground leading-none">
              {uniqueTypes}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Facility Types</p>
          </div>
        </div>

        <div className="w-px h-8 self-center bg-border" />

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-foreground leading-none">
              {totalCapacity.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Seats</p>
          </div>
        </div>
      </div>

      {/* Browser */}
      <StudentBrowser facilities={availableFacilities} />
    </div>
  );
}

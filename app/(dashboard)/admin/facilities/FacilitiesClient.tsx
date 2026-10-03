"use client";

import { useEffect, useState } from "react";
import { FacilitiesTable } from "@/components/admin/facilities/FacilitiesTable";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, CheckCircle2, Wrench, Users } from "lucide-react";
import { Facility } from "@/lib/db/schema";

export default function AdminFacilitiesClient() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/facilities");
        if (res.ok) {
          const data = await res.json();
          setFacilities(data);
        }
      } catch (err) {
        console.error("Failed to fetch facilities:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl bg-card border border-border" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg bg-card" />
          ))}
        </div>
      </div>
    );
  }

  const totalFacilities = facilities.length;
  const availableCount = facilities.filter((f) => f.status === "AVAILABLE").length;
  const maintenanceCount = facilities.filter((f) => f.status === "UNDER_MAINTENANCE").length;
  const totalSeats = facilities.reduce((sum, f) => sum + (f.capacity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Facilities
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage campus infrastructure, opening hours, and operational status.
        </p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Facilities
              </p>
              <p className="font-display text-2xl font-semibold text-foreground mt-1">
                {totalFacilities}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Available
              </p>
              <p className="font-display text-2xl font-semibold text-emerald-400 mt-1">
                {availableCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Under Maintenance
              </p>
              <p className="font-display text-2xl font-semibold text-purple-400 mt-1">
                {maintenanceCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <Wrench className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Seats
              </p>
              <p className="font-display text-2xl font-semibold text-foreground mt-1">
                {totalSeats}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <FacilitiesTable facilities={facilities} />
    </div>
  );
}

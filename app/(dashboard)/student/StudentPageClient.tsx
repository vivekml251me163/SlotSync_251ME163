"use client";

import { useEffect, useState } from "react";
import { StudentBrowser } from "@/components/student/StudentBrowser";
import { Building2, LayoutGrid, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Facility } from "@/lib/db/schema";

export default function StudentPageClient() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/facilities");
        if (res.ok) {
          const data = await res.json();
          const available = data.filter((f: Facility) => f.status === "AVAILABLE");
          setFacilities(available);
        }
      } catch (err) {
        console.error("Failed to fetch facilities for student view:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl bg-card border border-border" />
        <Skeleton className="h-96 w-full rounded-xl bg-card" />
      </div>
    );
  }

  const totalAvailable = facilities.length;
  const uniqueTypes = new Set(facilities.map((f) => f.type)).size;
  const totalCapacity = facilities.reduce((sum, f) => sum + (f.capacity || 0), 0);

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
      <StudentBrowser facilities={facilities} />
    </div>
  );
}

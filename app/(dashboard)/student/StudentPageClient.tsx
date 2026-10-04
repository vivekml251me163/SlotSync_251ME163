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
      <div className="space-y-4 animate-fade-up">
        <Skeleton className="h-12 w-full rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
        <Skeleton className="h-96 w-full rounded-2xl bg-white/[0.03]" />
      </div>
    );
  }

  const totalAvailable = facilities.length;
  const uniqueTypes = new Set(facilities.map((f) => f.type)).size;
  const totalCapacity = facilities.reduce((sum, f) => sum + (f.capacity || 0), 0);

  const stats = [
    { label: "Facilities Available", value: totalAvailable, icon: Building2, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "Facility Types", value: uniqueTypes, icon: LayoutGrid, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { label: "Total Seats", value: totalCapacity.toLocaleString(), icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="space-y-7 animate-fade-up">
      {/* ── Page Header ── */}
      <div>
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">
          Student / Browse
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Browse Facilities
        </h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          View real-time slot availability across campus.
        </p>
      </div>

      {/* ── Stat Strip ── */}
      <div className="flex flex-wrap gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.02] glow-card"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${bg} border ${border}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className={`font-display text-xl font-semibold leading-none ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Browser ── */}
      <StudentBrowser facilities={facilities} />
    </div>
  );
}

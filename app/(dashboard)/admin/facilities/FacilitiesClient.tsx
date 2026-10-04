"use client";

import { useEffect, useState, useCallback } from "react";
import { FacilitiesTable } from "@/components/admin/facilities/FacilitiesTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, CheckCircle2, Wrench, Users, RefreshCw } from "lucide-react";
import { Facility } from "@/lib/db/schema";

export default function AdminFacilitiesClient() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
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
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-up">
        <Skeleton className="h-16 w-full rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl bg-white/[0.03]" />
          ))}
        </div>
      </div>
    );
  }

  const totalFacilities = facilities.length;
  const availableCount = facilities.filter((f) => f.status === "AVAILABLE").length;
  const maintenanceCount = facilities.filter((f) => f.status === "UNDER_MAINTENANCE").length;
  const totalSeats = facilities.reduce((sum, f) => sum + (f.capacity || 0), 0);

  const stats = [
    { label: "Total", value: totalFacilities, icon: Building2, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "Available", value: availableCount, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Maintenance", value: maintenanceCount, icon: Wrench, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Total Seats", value: totalSeats, icon: Users, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  ];

  return (
    <div className="space-y-7 animate-fade-up">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">
            Admin / Facilities
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Facilities
          </h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Manage campus infrastructure, opening hours, and operational status.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-50 shrink-0 mt-6"
          title="Refresh facilities"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4 glow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                {label}
              </p>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg} border ${border}`}>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
            </div>
            <p className={`font-display text-2xl font-semibold ${color}`}>
              {value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div>
        <FacilitiesTable facilities={facilities} onRefresh={loadData} />
      </div>
    </div>
  );
}


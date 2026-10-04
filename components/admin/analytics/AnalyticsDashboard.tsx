"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsSkeleton } from "./AnalyticsSkeleton";
import { useCountUp } from "@/hooks/useCountUp";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  UserX,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

// ── Dynamic imports (ssr: false) to avoid Recharts/window issues ──────────────
const LineChartCard = dynamic(() => import("./LineChartCard"), { ssr: false });
const BarChartCard = dynamic(() => import("./BarChartCard"), { ssr: false });
const HorizontalBarChartCard = dynamic(() => import("./HorizontalBarChartCard"), { ssr: false });

// ── Types ─────────────────────────────────────────────────────────────────────
interface AnalyticsData {
  mostBookedFacilities: Array<{ facilityId: string; facilityName: string; bookingCount: number }>;
  peakHours: Array<{ hour: number; bookingCount: number }>;
  usageTrend: Array<{
    period: string;
    bookingCount: number;
    approvedCount: number;
    cancelledCount: number;
  }>;
  totalStats: {
    total: number;
    approved: number;
    rejected: number;
    cancelled: number;
    pending: number;
    noShows: number;
  };
  topUsers: Array<{ userId: string; userName: string; bookingCount: number }>;
  waitlistStats: {
    totalWaiting: number;
    avgWaitlistLength: number;
    promotionCount: number;
  };
}

// ── Animated stat card ────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  iconClass,
  loaded,
}: {
  label: string;
  value: number;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  loaded: boolean;
}) {
  const display = useCountUp(value, 800, loaded);
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {label}
          </span>
          <Icon className={`w-4 h-4 ${iconClass}`} />
        </div>
        <p className="font-display text-3xl font-semibold text-foreground">{display}</p>
        <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export function AnalyticsDashboard() {
  const [range, setRange] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (selectedRange: string) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/analytics?range=${selectedRange}`);
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Failed to load analytics.");
      } else {
        setData(result);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(range);
  }, [range, fetchAnalytics]);

  useEffect(() => {
    const onFocus = () => fetchAnalytics(range);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [range, fetchAnalytics]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) return <AnalyticsSkeleton />;

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <AlertTriangle className="w-10 h-10 text-destructive opacity-80" />
        <div>
          <p className="text-sm font-medium text-foreground">Failed to load analytics.</p>
          <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
        </div>
        <button
          onClick={() => fetchAnalytics(range)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const stats = data?.totalStats ?? {
    total: 0, approved: 0, rejected: 0, cancelled: 0, pending: 0, noShows: 0,
  };
  const loaded = !isLoading && data !== null;

  const statCards = [
    { label: "Total",     value: stats.total,     sublabel: "All time total",          icon: BarChart3,     iconClass: "text-muted-foreground" },
    { label: "Approved",  value: stats.approved,  sublabel: "Approved or completed",   icon: CheckCircle2,  iconClass: "text-green-400" },
    { label: "Pending",   value: stats.pending,   sublabel: "Awaiting review",         icon: Clock,         iconClass: "text-yellow-400" },
    { label: "Rejected",  value: stats.rejected,  sublabel: "Admin rejected",          icon: XCircle,       iconClass: "text-red-400" },
    { label: "Cancelled", value: stats.cancelled, sublabel: "User cancelled",          icon: Ban,           iconClass: "text-slate-400" },
    { label: "No-Shows",  value: stats.noShows,   sublabel: "Missed slots",            icon: UserX,         iconClass: "text-orange-400" },
  ];

  const waitlist = data?.waitlistStats ?? { totalWaiting: 0, avgWaitlistLength: 0, promotionCount: 0 };
  const topUsers = data?.topUsers ?? [];

  return (
    <div className="space-y-6">
      {/* ── Section 1: Header + Range Selector ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Campus facility usage insights</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAnalytics(range)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-card border border-border hover:bg-accent hover:text-foreground text-muted-foreground transition-colors disabled:opacity-50"
            title="Refresh analytics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </button>
          <Tabs value={range} onValueChange={(v) => setRange(v as typeof range)}>
            <TabsList className="bg-muted/50 border border-border">
              <TabsTrigger value="daily"   className="text-xs px-4">Daily</TabsTrigger>
              <TabsTrigger value="weekly"  className="text-xs px-4">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-4">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* ── Section 2: Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {statCards.map((c) => (
          <StatCard key={c.label} {...c} loaded={loaded} />
        ))}
      </div>

      {/* ── Section 3: Charts row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LineChartCard data={data?.usageTrend ?? []} range={range} />
        <BarChartCard data={data?.peakHours ?? []} />
      </div>

      {/* ── Section 4: Charts row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HorizontalBarChartCard data={data?.mostBookedFacilities ?? []} />

        {/* Top Users + Waitlist stacked */}
        <div className="space-y-4">
          {/* Top Users */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-foreground">
                Most Active Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topUsers.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No user data available.</p>
              ) : (
                topUsers.map((user, i) => (
                  <div key={user.userId} className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-muted-foreground w-5 shrink-0 tabular-nums">
                        {i + 1}.
                      </span>
                      <p className="text-sm font-medium text-foreground truncate">{user.userName}</p>
                    </div>
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0 ml-2">
                      {user.bookingCount} bookings
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Waitlist Stats */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-foreground">
                Waitlist Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="font-display text-2xl font-semibold text-foreground">
                    {waitlist.totalWaiting}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Currently Waiting</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-foreground">
                    {waitlist.promotionCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Promoted</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-foreground">
                    {waitlist.avgWaitlistLength}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Avg Queue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

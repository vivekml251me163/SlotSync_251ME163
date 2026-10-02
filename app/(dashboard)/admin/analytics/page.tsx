"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";

interface AnalyticsData {
  mostBookedFacilities: Array<{ facilityId: string; facilityName: string; bookingCount: number }>;
  peakHours: Array<{ hour: number; bookingCount: number }>;
  usageTrend: Array<{ period: string; bookingCount: number; approvedCount: number; cancelledCount: number }>;
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

export default function AnalyticsPage() {
  const [range, setRange] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAnalytics = async (selectedRange: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/analytics?range=${selectedRange}`);
      const result = await res.json();

      if (!res.ok) {
        setErrorMsg(result.error || "Failed to load analytics.");
      } else {
        setData(result);
      }
    } catch {
      setErrorMsg("An error occurred while fetching analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const peakHoursFullData = Array.from({ length: 24 }).map((_, hour) => {
    const found = data?.peakHours.find((h) => Number(h.hour) === hour);
    return {
      hour: `${String(hour).padStart(2, "0")}:00`,
      bookingCount: found ? Number(found.bookingCount) : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header and Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-sm text-gray-500">
            Real-time usage metrics, facility demand, and system health.
          </p>
        </div>

        {/* Range Tabs */}
        <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-1">
          {(["daily", "weekly", "monthly"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                range === r
                  ? "bg-white text-blue-600 shadow-sm font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))
        ) : (
          <>
            <Card className="bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500">Total Requests</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {data?.totalStats.total || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500">Approved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {data?.totalStats.approved || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500">Pending</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {data?.totalStats.pending || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-600">
                  {data?.totalStats.rejected || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500">Cancelled</CardTitle>
                <XCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-700">
                  {data?.totalStats.cancelled || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500">No-Shows</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {data?.totalStats.noShows || 0}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Waitlist Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))
        ) : (
          <>
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 flex items-center gap-4">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-xs font-semibold text-purple-700 uppercase">Currently Waiting</p>
                <p className="text-xl font-bold text-purple-900">
                  {data?.waitlistStats.totalWaiting || 0} users
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="text-xs font-semibold text-indigo-700 uppercase">Avg Waitlist Length</p>
                <p className="text-xl font-bold text-indigo-900">
                  {data?.waitlistStats.avgWaitlistLength || 0} per slot
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-4">
              <Award className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase">Promoted from Waitlist</p>
                <p className="text-xl font-bold text-emerald-900">
                  {data?.waitlistStats.promotionCount || 0} bookings
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trend Line Chart */}
        <Card className="bg-white border-gray-200 p-4">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold text-gray-900">
              Booking Usage Trend ({range})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.usageTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bookingCount"
                    name="Total Requests"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="approvedCount"
                    name="Approved"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Most Booked Facilities Bar Chart */}
        <Card className="bg-white border-gray-200 p-4">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold text-gray-900">
              Top Most Booked Facilities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.mostBookedFacilities || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="facilityName" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="bookingCount" name="Approved Bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Peak Operating Hours Bar Chart */}
        <Card className="bg-white border-gray-200 p-4 lg:col-span-2">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold text-gray-900">
              Peak Hourly Booking Demand (00:00 - 23:00)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursFullData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="bookingCount" name="Approved Bookings" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Users Table */}
      <Card className="bg-white border-gray-200 p-4">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-bold text-gray-900">
            Top Active Users by Approved Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <Skeleton className="h-32 w-full rounded-md" />
          ) : (data?.topUsers || []).length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No active booking user data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-4 py-2 font-semibold">User Name</th>
                    <th className="px-4 py-2 font-semibold text-right">Approved Bookings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.topUsers.map((u) => (
                    <tr key={u.userId} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2 font-medium text-gray-900">{u.userName}</td>
                      <td className="px-4 py-2 text-right font-bold text-purple-700">
                        {u.bookingCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface FacilityBookingItem {
  facilityId: string;
  facilityName: string;
  bookingCount: number;
}

interface HorizontalBarChartCardProps {
  data: FacilityBookingItem[];
}

export default function HorizontalBarChartCard({ data }: HorizontalBarChartCardProps) {
  const hasData = data.length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">
          Most Booked Facilities
        </CardTitle>
        <CardDescription className="text-xs">Top 5 by approved bookings</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[220px] flex flex-col items-center justify-center gap-2">
            <BarChart3 className="w-8 h-8 text-muted-foreground opacity-40" />
            <p className="text-xs text-muted-foreground">No data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" barSize={16}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="facilityName"
                width={120}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
                cursor={{ fill: "hsl(var(--accent))" }}
              />
              <Bar
                dataKey="bookingCount"
                name="Bookings"
                fill="#4ade80"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

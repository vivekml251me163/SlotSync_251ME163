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

interface PeakHourItem {
  hour: number;
  bookingCount: number;
}

interface BarChartCardProps {
  data: PeakHourItem[];
}

export default function BarChartCard({ data }: BarChartCardProps) {
  // Fill all 24 hours — hours with no bookings default to 0
  const fullData = Array.from({ length: 24 }, (_, hour) => {
    const found = data.find((h) => Number(h.hour) === hour);
    return { hour, bookingCount: found ? Number(found.bookingCount) : 0 };
  });

  const hasData = data.length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">Peak Booking Hours</CardTitle>
        <CardDescription className="text-xs">Approved bookings by hour of day</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[260px] flex flex-col items-center justify-center gap-2">
            <BarChart3 className="w-8 h-8 text-muted-foreground opacity-40" />
            <p className="text-xs text-muted-foreground">No data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={fullData} barSize={20}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                tickFormatter={(h) => `${h}:00`}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(val) => [val, "Bookings"]}
                labelFormatter={(h) => `${h}:00 – ${Number(h) + 1}:00`}
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
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

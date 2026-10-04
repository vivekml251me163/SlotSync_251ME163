"use client";

import { useState } from "react";
import { Facility } from "@/lib/db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FacilitySelector } from "./FacilitySelector";
import { SlotGrid } from "@/components/slot-grid/SlotGrid";
import { MyBookingsTable } from "./MyBookingsTable";
import { MyWaitlistTable } from "./MyWaitlistTable";
import { CalendarDays, BookOpen, Clock } from "lucide-react";

interface FacultyBookingTabsProps {
  initialFacilities: Facility[];
  isStudent?: boolean;
  isReadOnly?: boolean;
  /** Called when MyBookingsTable loads — provides approved + pending counts */
  onBookingsCountUpdate?: (approved: number, pending: number) => void;
  /** Called when MyWaitlistTable loads — provides waitlist count */
  onWaitlistCountUpdate?: (count: number) => void;
}

interface CountData {
  activeBookings: number;
  waitlistEntries: number;
}

export function FacultyBookingTabs({
  initialFacilities,
  isStudent = false,
  isReadOnly = false,
  onBookingsCountUpdate,
  onWaitlistCountUpdate,
}: FacultyBookingTabsProps) {
  const readOnly = isStudent || isReadOnly;

  const [activeTab, setActiveTab] = useState<string>(readOnly ? "browse" : "book");
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  // Tab badge counts — updated by child tables when they load data
  const [counts, setCounts] = useState<CountData>({ activeBookings: 0, waitlistEntries: 0 });

  const selectedFacility = initialFacilities.find((f) => f.id === selectedFacilityId) ?? null;
  const canShowGrid = selectedFacilityId !== "" && selectedDate !== "";

  const handleBookingSuccess = () => {
    // Trigger fresh data load for My Bookings and redirect to "my-bookings" tab
    setRefreshKey((prev) => prev + 1);
    setActiveTab("my-bookings");
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="h-auto bg-card border border-border rounded-xl p-1 gap-1 flex-wrap">
        {/* Book a Slot tab — hidden for strict read-only/student */}
        {!readOnly && (
          <TabsTrigger
            value="book"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <CalendarDays className="h-4 w-4" />
            Book a Slot
          </TabsTrigger>
        )}

        {readOnly && (
          <TabsTrigger
            value="browse"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <CalendarDays className="h-4 w-4" />
            Browse Facilities
          </TabsTrigger>
        )}

        {!readOnly && (
          <TabsTrigger
            value="my-bookings"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <BookOpen className="h-4 w-4" />
            My Bookings
            {counts.activeBookings > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold tabular-nums data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground">
                {counts.activeBookings}
              </span>
            )}
          </TabsTrigger>
        )}

        {!readOnly && (
          <TabsTrigger
            value="my-waitlist"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <Clock className="h-4 w-4" />
            My Waitlist
            {counts.waitlistEntries > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold tabular-nums data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground">
                {counts.waitlistEntries}
              </span>
            )}
          </TabsTrigger>
        )}
      </TabsList>

      {/* ─── Book a Slot ─────────────────────────────────────── */}
      {!readOnly && (
        <TabsContent value="book" className="mt-6 space-y-6 outline-none">
          <FacilitySelector
            facilities={initialFacilities}
            selectedFacilityId={selectedFacilityId}
            onSelectFacility={setSelectedFacilityId}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {canShowGrid ? (
            <SlotGrid
              facilityId={selectedFacilityId}
              selectedDate={selectedDate}
              facility={selectedFacility}
              isStudent={false}
              onBookingSuccess={handleBookingSuccess}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center rounded-xl border border-dashed border-border bg-card/50">
              <CalendarDays className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-medium text-foreground">
                Select a facility and date
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                to view available time slots
              </p>
            </div>
          )}
        </TabsContent>
      )}

      {/* ─── Browse (read-only) ───────────────────────────────── */}
      {readOnly && (
        <TabsContent value="browse" className="mt-6 space-y-6 outline-none">
          <FacilitySelector
            facilities={initialFacilities}
            selectedFacilityId={selectedFacilityId}
            onSelectFacility={setSelectedFacilityId}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {canShowGrid ? (
            <SlotGrid
              facilityId={selectedFacilityId}
              selectedDate={selectedDate}
              facility={selectedFacility}
              isStudent={true}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center rounded-xl border border-dashed border-border bg-card/50">
              <CalendarDays className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-medium text-foreground">
                Select a facility and date
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                to browse available time slots
              </p>
            </div>
          )}
        </TabsContent>
      )}

      {/* ─── My Bookings ─────────────────────────────────────── */}
      {!readOnly && (
        <TabsContent value="my-bookings" className="mt-6 outline-none">
          <MyBookingsTable
            refreshKey={refreshKey}
            onCountsUpdate={(activeCount, approvedCount, pendingCount) => {
              setCounts((prev) => ({ ...prev, activeBookings: activeCount }));
              onBookingsCountUpdate?.(approvedCount, pendingCount);
            }}
          />
        </TabsContent>
      )}

      {/* ─── My Waitlist ─────────────────────────────────────── */}
      {!readOnly && (
        <TabsContent value="my-waitlist" className="mt-6 outline-none">
          <MyWaitlistTable
            onCountsUpdate={(count) => {
              setCounts((prev) => ({ ...prev, waitlistEntries: count }));
              onWaitlistCountUpdate?.(count);
            }}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}

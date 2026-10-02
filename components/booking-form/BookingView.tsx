"use client";

import { useState } from "react";
import { Facility } from "@/lib/db/schema";
import { FacilitySelector } from "./FacilitySelector";
import { SlotGrid } from "@/components/slot-grid/SlotGrid";
import { CalendarDays } from "lucide-react";

interface BookingViewProps {
  initialFacilities: Facility[];
  isStudent?: boolean;
}

export function BookingView({ initialFacilities, isStudent = false }: BookingViewProps) {
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const selectedFacility = initialFacilities.find((f) => f.id === selectedFacilityId) ?? null;
  const canShowGrid = selectedFacilityId !== "" && selectedDate !== "";

  return (
    <div className="space-y-6">
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
          isStudent={isStudent}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center rounded-xl border border-dashed border-border bg-card/50">
          <CalendarDays className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm font-medium text-foreground">Select a facility and date</p>
          <p className="text-xs text-muted-foreground mt-1">to view available time slots</p>
        </div>
      )}
    </div>
  );
}

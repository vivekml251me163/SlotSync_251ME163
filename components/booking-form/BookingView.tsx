"use client";

import { useState } from "react";
import { Facility } from "@/lib/db/schema";
import { FacilitySelector } from "./FacilitySelector";
import { SlotGrid } from "@/components/slot-grid/SlotGrid";

interface BookingViewProps {
  initialFacilities: Facility[];
  isStudent?: boolean;
}

export function BookingView({ initialFacilities, isStudent = false }: BookingViewProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    initialFacilities[0] || null
  );
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  return (
    <div className="space-y-6">
      <FacilitySelector
        initialFacilities={initialFacilities}
        selectedFacilityId={selectedFacility?.id || ""}
        onSelectFacility={setSelectedFacility}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-between">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Select Date</label>
          <input
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 block rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        {selectedFacility && (
          <div className="text-right text-sm">
            <span className="font-bold text-gray-900">{selectedFacility.name}</span>
            <p className="text-xs text-gray-500">
              Operating Hours: {selectedFacility.openingTime} - {selectedFacility.closingTime}
            </p>
          </div>
        )}
      </div>

      {selectedFacility ? (
        <SlotGrid
          facilityId={selectedFacility.id}
          selectedDate={selectedDate}
          facilityName={selectedFacility.name}
          isStudent={isStudent}
        />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500 bg-white">
          No facility selected. Please select a facility from above.
        </div>
      )}
    </div>
  );
}

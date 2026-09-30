"use client";

import { useState, useEffect, useTransition } from "react";
import { Facility } from "@/lib/db/schema";

interface FacilitySelectorProps {
  initialFacilities: Facility[];
  selectedFacilityId: string;
  onSelectFacility: (facility: Facility | null) => void;
}

export function FacilitySelector({
  initialFacilities,
  selectedFacilityId,
  onSelectFacility,
}: FacilitySelectorProps) {
  const [facilitiesList, setFacilitiesList] = useState<Facility[]>(initialFacilities);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [minCapacityFilter, setMinCapacityFilter] = useState<string>("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    async function filterFacilities() {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      if (minCapacityFilter) params.set("minCapacity", minCapacityFilter);

      try {
        const res = await fetch(`/api/facilities?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setFacilitiesList(data);
          const found = data.find((f: Facility) => f.id === selectedFacilityId);
          if (!found && data.length > 0) {
            onSelectFacility(data[0]);
          } else if (data.length === 0) {
            onSelectFacility(null);
          }
        }
      } catch {
        // Fallback
      }
    }

    startTransition(() => {
      filterFacilities();
    });
  }, [typeFilter, minCapacityFilter]);

  const selectedFacility = facilitiesList.find((f) => f.id === selectedFacilityId) || facilitiesList[0] || null;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Select Facility</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Facility</label>
          <select
            value={selectedFacility?.id || ""}
            onChange={(e) => {
              const fac = facilitiesList.find((f) => f.id === e.target.value) || null;
              onSelectFacility(fac);
            }}
            className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {facilitiesList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.location} - Cap: {f.capacity})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Filter by Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="classroom">Classroom</option>
            <option value="seminar_hall">Seminar Hall</option>
            <option value="lab">Lab</option>
            <option value="sports">Sports Complex</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Min Capacity</label>
          <input
            type="number"
            placeholder="e.g. 30"
            value={minCapacityFilter}
            onChange={(e) => setMinCapacityFilter(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

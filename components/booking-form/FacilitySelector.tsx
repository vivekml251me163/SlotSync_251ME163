"use client";

import { useMemo } from "react";
import { Facility } from "@/lib/db/schema";
import { getISTDateString } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { MapPin, Users, Clock, Calendar as CalendarIcon } from "lucide-react";

interface FacilitySelectorProps {
  facilities: Facility[];
  selectedFacilityId: string;
  onSelectFacility: (facilityId: string) => void;
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (dateStr: string) => void;
}

function getTypeBadge(type: string) {
  const typeMap: Record<string, { label: string; className: string }> = {
    classroom: { label: "Classroom", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    seminar_hall: { label: "Seminar Hall", className: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
    lab: { label: "Lab", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    sports: { label: "Sports", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  };
  const conf = typeMap[type] || { label: type, className: "bg-slate-500/15 text-slate-400 border-slate-500/30" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${conf.className}`}>
      {conf.label}
    </span>
  );
}

export function FacilitySelector({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  selectedDate,
  onSelectDate,
}: FacilitySelectorProps) {
  // Group facilities by type
  const groupedFacilities = useMemo(() => {
    const groups: Record<string, Facility[]> = {
      classroom: [],
      seminar_hall: [],
      lab: [],
      sports: [],
    };
    facilities.forEach((f) => {
      if (groups[f.type]) {
        groups[f.type].push(f);
      } else {
        if (!groups[f.type]) groups[f.type] = [];
        groups[f.type].push(f);
      }
    });
    return groups;
  }, [facilities]);

  const selectedFacility = useMemo(
    () => facilities.find((f) => f.id === selectedFacilityId),
    [facilities, selectedFacilityId]
  );

  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return undefined;
    const [y, m, d] = selectedDate.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }, [selectedDate]);

  const isToday = useMemo(() => {
    if (!selectedDate) return false;
    return selectedDate === getISTDateString();
  }, [selectedDate]);

  const formattedDateDisplay = useMemo(() => {
    if (!selectedDateObj) return "Select Date";
    return selectedDateObj.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }, [selectedDateObj]);

  const handleDatePick = (date?: Date) => {
    if (!date) return;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    onSelectDate(`${year}-${month}-${day}`);
  };

  const todayDate = new Date(new Date().toDateString());

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-wrap bg-card p-4 rounded-xl border border-border">
        {/* Facility Dropdown */}
        <div className="space-y-1.5 flex-1 min-w-[240px]">
          <Label htmlFor="facility-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Select Facility
          </Label>
          <Select value={selectedFacilityId} onValueChange={onSelectFacility}>
            <SelectTrigger id="facility-select" className="w-full bg-background border-border text-sm">
              <SelectValue placeholder="Choose a facility..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border max-h-72">
              {Object.entries(groupedFacilities).map(([typeKey, list]) => {
                if (list.length === 0) return null;
                const labelName = typeKey.replace("_", " ").toUpperCase();
                return (
                  <SelectGroup key={typeKey}>
                    <SelectLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                      {labelName}
                    </SelectLabel>
                    {list.map((f) => (
                      <SelectItem key={f.id} value={f.id} className="cursor-pointer text-sm">
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="font-medium text-foreground">{f.name}</span>
                          <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                            {f.capacity} seats
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Date Picker */}
        <div className="space-y-1.5 min-w-[200px]">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Select Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center justify-between gap-2 w-full px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                  isToday
                    ? "bg-primary/5 border-primary/30 text-primary font-bold"
                    : "bg-background border-border text-foreground hover:bg-accent"
                }`}
              >
                <span className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                  {formattedDateDisplay}
                </span>
                {isToday && (
                  <span className="text-[10px] uppercase font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    Today
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
              <CalendarPicker
                mode="single"
                selected={selectedDateObj}
                onSelect={handleDatePick}
                disabled={(d) => d < todayDate}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Facility Info Strip */}
      {selectedFacility && (
        <div className="flex items-center gap-4 bg-card border border-border rounded-lg px-4 py-2.5 text-sm flex-wrap shadow-sm">
          <div>{getTypeBadge(selectedFacility.type)}</div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{selectedFacility.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{selectedFacility.capacity} seats</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-mono">
              {selectedFacility.openingTime} &ndash; {selectedFacility.closingTime}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

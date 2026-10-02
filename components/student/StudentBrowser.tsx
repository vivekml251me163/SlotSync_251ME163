"use client";

import { useState, useEffect, useMemo } from "react";
import { Facility } from "@/lib/db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { StatusBadge } from "@/components/ui/status-badge";
import { StudentSlotGrid } from "./StudentSlotGrid";
import {
  Search,
  MapPin,
  Users,
  Clock,
  Calendar as CalendarIcon,
  CalendarDays,
} from "lucide-react";

interface StudentBrowserProps {
  facilities: Facility[];
}

const TYPE_LABELS: Record<string, string> = {
  classroom: "Classroom",
  seminar_hall: "Seminar Hall",
  lab: "Lab",
  sports: "Sports",
};

function getTypeBadge(type: string) {
  const typeMap: Record<string, { label: string; className: string }> = {
    classroom: { label: "Classroom", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    seminar_hall: { label: "Seminar Hall", className: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
    lab: { label: "Lab", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    sports: { label: "Sports", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  };
  const conf = typeMap[type] || { label: type, className: "bg-slate-500/15 text-slate-400 border-slate-500/30" };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${conf.className}`}
    >
      {conf.label}
    </span>
  );
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export function StudentBrowser({ facilities }: StudentBrowserProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Auto-select first facility on mount
  useEffect(() => {
    if (facilities.length > 0 && !selectedFacility) {
      setSelectedFacility(facilities[0]);
    }
  }, [facilities]); // eslint-disable-line react-hooks/exhaustive-deps

  // Unique types in full list
  const allTypes = useMemo(() => {
    const set = new Set<string>();
    facilities.forEach((f) => set.add(f.type));
    return Array.from(set).sort();
  }, [facilities]);

  // Type counts (from full unfiltered list, not search-filtered)
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: facilities.length };
    facilities.forEach((f) => {
      counts[f.type] = (counts[f.type] || 0) + 1;
    });
    return counts;
  }, [facilities]);

  // Filtered list (search + type)
  const filteredFacilities = useMemo(() => {
    const q = search.toLowerCase();
    return facilities.filter((f) => {
      const matchesType = typeFilter === "all" || f.type === typeFilter;
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [facilities, search, typeFilter]);

  // Date helpers
  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return undefined;
    const [y, m, d] = selectedDate.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
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

  const isToday = selectedDate === todayStr();
  const todayDate = new Date(new Date().toDateString());

  const handleDatePick = (date?: Date) => {
    if (!date) return;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    setSelectedDate(`${y}-${m}-${d}`);
    setDatePickerOpen(false);
  };

  return (
    <div className="lg:grid lg:grid-cols-[320px_1fr] gap-6">
      {/* ── LEFT PANEL: Facility List ─────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            id="student-facility-search"
            type="text"
            placeholder="Search facilities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
          />
        </div>

        {/* Type filter tabs */}
        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsList className="h-auto bg-card border border-border rounded-lg p-1 w-full flex-wrap gap-1">
            <TabsTrigger
              value="all"
              className="flex-1 text-xs rounded-md py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All ({typeCounts.all ?? 0})
            </TabsTrigger>
            {allTypes.map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="flex-1 text-xs rounded-md py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
              >
                {TYPE_LABELS[t] ?? t} ({typeCounts[t] ?? 0})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Facility cards — desktop: vertical scroll, mobile: horizontal scroll */}
        <div className="hidden lg:block">
          <ScrollArea className="h-[calc(100vh-240px)]">
            <div className="space-y-2 pr-3">
              {filteredFacilities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="w-8 h-8 text-muted-foreground mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">No facilities match your search.</p>
                </div>
              ) : (
                filteredFacilities.map((f) => (
                  <Card
                    key={f.id}
                    id={`facility-card-${f.id}`}
                    onClick={() => setSelectedFacility(f)}
                    className={`cursor-pointer transition-all hover:border-primary/50 bg-card ${
                      selectedFacility?.id === f.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between p-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{f.location}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                        {getTypeBadge(f.type)}
                        <span className="text-xs text-muted-foreground">
                          <Users className="w-3 h-3 inline mr-0.5" />
                          {f.capacity}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 pb-3 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/50 pt-2">
                      <Clock className="w-3 h-3 shrink-0" />
                      {f.openingTime} – {f.closingTime}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Mobile: horizontal scroll strip */}
        <div className="flex lg:hidden gap-2 overflow-x-auto pb-2">
          {filteredFacilities.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 px-2">No facilities match.</p>
          ) : (
            filteredFacilities.map((f) => (
              <Card
                key={f.id}
                onClick={() => setSelectedFacility(f)}
                className={`cursor-pointer shrink-0 min-w-[200px] transition-all hover:border-primary/50 bg-card ${
                  selectedFacility?.id === f.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {f.location}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    {getTypeBadge(f.type)}
                    <span className="text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-0.5" />
                      {f.openingTime}–{f.closingTime}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Slot Viewer ──────────────────────────── */}
      <div>
        {!selectedFacility ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center border border-dashed border-border rounded-xl">
            <CalendarDays className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm font-medium text-foreground">Select a facility</p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a facility from the list to view availability
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Facility header card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl font-semibold text-foreground truncate">
                    {selectedFacility.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{selectedFacility.location}</p>
                </div>
                <div className="shrink-0">{getTypeBadge(selectedFacility.type)}</div>
              </div>
              <div className="flex flex-wrap items-center gap-5 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {selectedFacility.capacity} seats
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedFacility.openingTime} – {selectedFacility.closingTime}
                </span>
                <StatusBadge status={selectedFacility.status} />
              </div>
            </div>

            {/* Date picker */}
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <button
                  id="student-date-picker"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    isToday
                      ? "bg-primary/5 border-primary/30 text-primary font-bold"
                      : "bg-card border-border text-foreground hover:bg-accent"
                  }`}
                >
                  <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                  {formattedDateDisplay}
                  {isToday && (
                    <span className="text-[10px] uppercase font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">
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

            {/* Read-only slot grid */}
            <StudentSlotGrid
              facilityId={selectedFacility.id}
              date={selectedDate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

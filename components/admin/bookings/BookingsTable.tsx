"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
} from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { BookingRowActions, type BookingWithRelations } from "./BookingRowActions";
import { formatDate, formatTime, relativeTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  X,
  CalendarOff,
} from "lucide-react";

interface BookingsTableProps {
  bookings: BookingWithRelations[];
}

function getTypeBadge(type?: string) {
  if (!type) return null;

  const typeMap: Record<string, { label: string; className: string }> = {
    classroom: {
      label: "Classroom",
      className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    seminar_hall: {
      label: "Seminar Hall",
      className: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    },
    lab: {
      label: "Lab",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    sports: {
      label: "Sports",
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
  };

  const conf = typeMap[type] || {
    label: type,
    className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${conf.className}`}
    >
      {conf.label}
    </span>
  );
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [expanded, setExpanded] = useState({});

  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Extract unique facilities for filter dropdown
  const uniqueFacilities = useMemo(() => {
    const map = new Map<string, string>();
    bookings.forEach((b) => {
      if (b.facility) map.set(b.facilityId, b.facility.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [bookings]);

  // Compute active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (globalFilter.trim()) count++;
    if (dateFilter) count++;
    columnFilters.forEach((f) => {
      if (f.value && f.value !== "ALL") count++;
    });
    return count;
  }, [globalFilter, dateFilter, columnFilters]);

  const clearAllFilters = () => {
    setGlobalFilter("");
    setDateFilter(undefined);
    setColumnFilters([]);
  };

  // Custom filter logic incorporating Date Picker
  const filteredData = useMemo(() => {
    return bookings.filter((b) => {
      if (dateFilter) {
        const year = dateFilter.getFullYear();
        const month = String(dateFilter.getMonth() + 1).padStart(2, "0");
        const day = String(dateFilter.getDate()).padStart(2, "0");
        const selectedDateStr = `${year}-${month}-${day}`;
        if (b.date !== selectedDateStr) return false;
      }
      return true;
    });
  }, [bookings, dateFilter]);

  const columns = useMemo<ColumnDef<BookingWithRelations>[]>(
    () => [
      {
        id: "expander",
        header: "",
        cell: ({ row }) => {
          const hasNotes = row.original.rejectionReason || row.original.cancelReason;
          if (!hasNotes) return <div className="w-4" />;

          return (
            <button
              onClick={() => row.toggleExpanded()}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4 text-primary" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          );
        },
      },
      {
        id: "user",
        header: "Requested By",
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-medium text-foreground">
              {row.original.user?.name || "Unknown User"}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.original.user?.email}
            </div>
          </div>
        ),
      },
      {
        id: "facility",
        header: "Facility",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">
              {row.original.facility?.name || "Facility"}
            </div>
            <div>{getTypeBadge(row.original.facility?.type)}</div>
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
          >
            Date
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm text-foreground">
            {formatDate(row.original.date)}
          </span>
        ),
      },
      {
        id: "slot",
        header: "Time Slot",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground">
            {formatTime(row.original.slotStart)} &ndash; {formatTime(row.original.slotEnd)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
          >
            Requested
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {relativeTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <BookingRowActions
            booking={row.original}
            onRefresh={() => router.refresh()}
            onToast={(text) => setToastMsg({ type: "success", text })}
          />
        ),
      },
    ],
    [router]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      expanded,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      const userName = (row.original.user?.name || "").toLowerCase();
      const userEmail = (row.original.user?.email || "").toLowerCase();
      const facilityName = (row.original.facility?.name || "").toLowerCase();
      return (
        userName.includes(search) ||
        userEmail.includes(search) ||
        facilityName.includes(search)
      );
    },
  });

  const statusFilterValue = (table.getColumn("status")?.getFilterValue() as string) || "ALL";
  const facilityFilterValue = (table.getColumn("facilityId")?.getFilterValue() as string) || "ALL";

  return (
    <div className="space-y-4">
      {toastMsg && (
        <div
          className={`flex items-center justify-between rounded-lg p-3 text-sm font-medium ${
            toastMsg.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          <span className="flex items-center gap-2">
            {toastMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {toastMsg.text}
          </span>
          <button
            onClick={() => setToastMsg(null)}
            className="text-xs underline hover:opacity-100 opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        {/* Global Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search user name or facility..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-background border-border focus-visible:ring-primary/50 text-sm"
          />
        </div>

        {/* Dropdown & Date Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <Select
            value={statusFilterValue}
            onValueChange={(val) =>
              table.getColumn("status")?.setFilterValue(val === "ALL" ? undefined : val)
            }
          >
            <SelectTrigger className="w-[160px] bg-background border-border text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="CANCELLATION_REQUESTED">Cancel Requested</SelectItem>
            </SelectContent>
          </Select>

          {/* Facility Filter */}
          <Select
            value={facilityFilterValue}
            onValueChange={(val) =>
              table.getColumn("facilityId")?.setFilterValue(val === "ALL" ? undefined : val)
            }
          >
            <SelectTrigger className="w-[160px] bg-background border-border text-xs">
              <SelectValue placeholder="All Facilities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Facilities</SelectItem>
              {uniqueFacilities.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Single Date Picker Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>
                  {dateFilter
                    ? dateFilter.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Filter Date"}
                </span>
                {dateFilter && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setDateFilter(undefined);
                    }}
                    className="ml-1 rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="end">
              <CalendarPicker
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
              />
            </PopoverContent>
          </Popover>

          {/* Active Filter Count Pill */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors"
            >
              <span>{activeFilterCount} active filter(s)</span>
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3.5 font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                      <CalendarOff className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-foreground">
                        No bookings found
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Adjust your filters or check back later.
                      </p>
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-primary font-semibold hover:underline mt-1"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const status = row.original.status;
                let bgTint = "hover:bg-accent/50";
                if (status === "PENDING") bgTint = "bg-yellow-500/[0.03] hover:bg-yellow-500/[0.07]";
                else if (status === "CANCELLATION_REQUESTED") bgTint = "bg-orange-500/[0.03] hover:bg-orange-500/[0.07]";

                return (
                  <tr key={row.id} className={`transition-colors cursor-default ${bgTint}`}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Expanded Row Content Sub-row rendering */}
      {table.getRowModel().rows.map((row) => {
        if (!row.getIsExpanded()) return null;
        const { rejectionReason, cancelReason } = row.original;
        if (!rejectionReason && !cancelReason) return null;

        return (
          <div
            key={`expanded-${row.id}`}
            className="rounded-lg border border-border bg-muted/20 p-4 text-xs space-y-2 font-mono text-foreground ml-6 shadow-inner"
          >
            {rejectionReason && (
              <div>
                <strong className="text-destructive uppercase">Rejection Reason:</strong>{" "}
                <span className="text-foreground">{rejectionReason}</span>
              </div>
            )}
            {cancelReason && (
              <div>
                <strong className="text-amber-400 uppercase">Cancellation Reason:</strong>{" "}
                <span className="text-foreground">{cancelReason}</span>
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination Footer */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 text-xs text-muted-foreground">
          <div>
            Showing{" "}
            <span className="font-semibold text-foreground">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>{" "}
            of <span className="font-semibold text-foreground">{table.getFilteredRowModel().rows.length}</span> bookings
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {[10, 25, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded-md border border-border px-3 py-1.5 font-medium hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded-md border border-border px-3 py-1.5 font-medium hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Facility } from "@/lib/db/schema";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
} from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { FacilityRowActions } from "./FacilityRowActions";
import { FacilityDialog } from "./FacilityDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface FacilitiesTableProps {
  facilities: Facility[];
  onRefresh?: () => void;
}

function getTypeBadge(type: string) {
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
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${conf.className}`}
    >
      {conf.label}
    </span>
  );
}

export function FacilitiesTable({ facilities, onRefresh }: FacilitiesTableProps) {
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const columns = useMemo<ColumnDef<Facility>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/50 cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/50 cursor-pointer"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
          >
            Facility Name
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
          <span className="font-semibold text-foreground">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
          >
            Type
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => getTypeBadge(row.original.type),
      },
      {
        accessorKey: "location",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
          >
            Location
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
          <span className="text-muted-foreground">{row.original.location}</span>
        ),
      },
      {
        accessorKey: "capacity",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
          >
            Capacity
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
          <span className="font-mono text-sm">{row.original.capacity} seats</span>
        ),
      },
      {
        id: "hours",
        header: "Operating Hours",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.openingTime} &ndash; {row.original.closingTime}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <FacilityRowActions
            facility={row.original}
            onRefresh={() => { onRefresh ? onRefresh() : router.refresh(); }}
            onToast={(text) => setToastMsg({ type: "success", text })}
          />
        ),
      },
    ],
    [router]
  );

  const table = useReactTable({
    data: facilities,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const typeFilterValue = (table.getColumn("type")?.getFilterValue() as string) || "ALL";
  const statusFilterValue = (table.getColumn("status")?.getFilterValue() as string) || "ALL";

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

      {/* Toolbar / Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search facility name or location..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-background border-border focus-visible:ring-primary/50 text-sm"
          />
        </div>

        {/* Filters & Action */}
        <div className="flex items-center gap-3">
          {/* Type Filter */}
          <Select
            value={typeFilterValue}
            onValueChange={(val) =>
              table.getColumn("type")?.setFilterValue(val === "ALL" ? undefined : val)
            }
          >
            <SelectTrigger className="w-[150px] bg-background border-border text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="classroom">Classroom</SelectItem>
              <SelectItem value="seminar_hall">Seminar Hall</SelectItem>
              <SelectItem value="lab">Lab</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilterValue}
            onValueChange={(val) =>
              table.getColumn("status")?.setFilterValue(val === "ALL" ? undefined : val)
            }
          >
            <SelectTrigger className="w-[150px] bg-background border-border text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
              <SelectItem value="UNDER_MAINTENANCE">Maintenance</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Facility
          </button>
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
                      <Building2 className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-foreground">
                        No facilities found
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Add your first facility to get started or clear filters.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm mt-2"
                    >
                      <Plus className="h-4 w-4" /> Add Facility
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-accent/50 transition-colors cursor-default"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
            of <span className="font-semibold text-foreground">{table.getFilteredRowModel().rows.length}</span> facilities
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

      {/* Create Facility Dialog */}
      <FacilityDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          onRefresh ? onRefresh() : router.refresh();
          setToastMsg({ type: "success", text: "Facility created successfully." });
        }}
      />
    </div>
  );
}

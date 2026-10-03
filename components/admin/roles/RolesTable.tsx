"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock, ShieldCheck } from "lucide-react";
import { RoleItem, PermissionItem } from "./RoleDialog";
import { RoleRowActions } from "./RoleRowActions";

interface RolesTableProps {
  roles: RoleItem[];
  onEdit: (role: RoleItem) => void;
  onDelete: (role: RoleItem) => void;
}

function formatPermissionName(name: string): string {
  return name
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function PermissionBadgeList({ permissions }: { permissions: PermissionItem[] }) {
  if (!permissions || permissions.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const visiblePerms = permissions.slice(0, 3);
  const extraCount = permissions.length - 3;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visiblePerms.map((perm) => (
        <span
          key={perm.id}
          className="inline-flex items-center bg-primary/10 text-primary text-xs font-medium rounded-full px-2 py-0.5"
        >
          {formatPermissionName(perm.name)}
        </span>
      ))}
      {extraCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center bg-muted text-muted-foreground text-xs font-medium rounded-full px-2 py-0.5 cursor-default hover:bg-muted/80">
                +{extraCount} more
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground border-border p-2 max-w-xs">
              <div className="flex flex-wrap gap-1 max-w-xs">
                {permissions.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center bg-primary/10 text-primary text-[11px] font-medium rounded-full px-2 py-0.5"
                  >
                    {formatPermissionName(p.name)}
                  </span>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export function RolesTable({ roles, onEdit, onDelete }: RolesTableProps) {
  const columns = useMemo<ColumnDef<RoleItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Role Name",
        cell: ({ row }) => {
          const role = row.original;
          return (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{role.name}</span>
              {role.isDefault && (
                <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-xs font-normal px-2 py-0.5 rounded-md border border-border">
                  <Lock className="w-3 h-3" />
                  Default
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.description || "—"}
          </span>
        ),
      },
      {
        id: "permissions",
        header: "Permissions",
        cell: ({ row }) => (
          <PermissionBadgeList permissions={row.original.permissions} />
        ),
      },
      {
        id: "userCount",
        header: "Users",
        cell: ({ row }) => (
          <span className="bg-secondary text-secondary-foreground text-xs font-mono rounded-full px-2.5 py-0.5 inline-block">
            {row.original.userCount}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RoleRowActions
            role={row.original}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ),
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: roles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-muted-foreground font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={
                  row.original.isDefault
                    ? "bg-muted/10 hover:bg-muted/20"
                    : "hover:bg-muted/50"
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center text-center space-y-2 py-6">
                  <div className="p-3 bg-muted/20 rounded-full text-muted-foreground">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">
                    No custom roles yet
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Create a role to define a custom permission set.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { RoleItem } from "./RoleDialog";
import { RoleAssignmentCell, UserItem } from "./RoleAssignmentCell";

interface UsersTableProps {
  users: UserItem[];
  allRoles: RoleItem[];
  currentUserId: string;
}

export function UsersTable({ users, allRoles, currentUserId }: UsersTableProps) {
  const [userList, setUserList] = useState<UserItem[]>(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const handleUserRoleUpdated = (
    userId: string,
    newRoleId: string,
    newRoleName: string
  ) => {
    setUserList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, roleId: newRoleId, roleName: newRoleName }
          : u
      )
    );
  };

  const filteredUsers = useMemo(() => {
    return userList.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q));

      const userRoleId =
        u.roleId ||
        allRoles.find((r) => r.name.toUpperCase() === u.role.toUpperCase())?.id;

      const matchesRole =
        roleFilter === "ALL" ||
        userRoleId === roleFilter ||
        (u.roleName && u.roleName.toUpperCase() === roleFilter.toUpperCase()) ||
        u.role.toUpperCase() === roleFilter.toUpperCase();

      return matchesSearch && matchesRole;
    });
  }, [userList, searchQuery, roleFilter, allRoles]);

  const columns = useMemo<ColumnDef<UserItem>[]>(
    () => [
      {
        id: "user",
        header: "User",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div>
              <p className="font-medium text-foreground text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.department || "—"}
          </span>
        ),
      },
      {
        id: "currentRole",
        header: "Current Role",
        cell: ({ row }) => (
          <RoleAssignmentCell
            user={row.original}
            allRoles={allRoles}
            currentUserId={currentUserId}
            onUserRoleUpdated={handleUserRoleUpdated}
          />
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
    ],
    [allRoles, currentUserId]
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="ALL">All Roles</SelectItem>
            {allRoles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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
                <TableRow key={row.id} className="hover:bg-muted/50">
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
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground">
                      No users found
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      Adjust your search or role filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

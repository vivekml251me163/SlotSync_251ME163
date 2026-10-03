"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Key, Users } from "lucide-react";
import { RBACPageClient } from "@/components/admin/roles/RBACPageClient";
import { Skeleton } from "@/components/ui/skeleton";

interface RolesClientProps {
  currentUserId: string;
}

export default function AdminRolesClient({ currentUserId }: RolesClientProps) {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [rolesRes, usersRes] = await Promise.all([
          fetch("/api/roles"),
          fetch("/api/users"),
        ]);

        if (rolesRes.ok && usersRes.ok) {
          const rolesData = await rolesRes.json();
          const usersData = await usersRes.json();

          const fetchedRoles = rolesData.roles || [];
          const fetchedPerms = rolesData.allPermissions || [];
          const fetchedUsers = usersData || [];

          const formattedUsers = fetchedUsers.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.roleEnum || u.role || "STUDENT",
            department: u.department,
            createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
            roleId: u.roleId || fetchedRoles.find((r: any) => r.name.toUpperCase() === String(u.roleEnum || u.role).toUpperCase())?.id || null,
            roleName: u.roleName || u.roleEnum || u.role,
          }));

          const rolesWithData = fetchedRoles.map((r: any) => {
            const userCount = formattedUsers.filter(
              (u: any) => u.roleId === r.id || u.roleName?.toUpperCase() === r.name?.toUpperCase()
            ).length;

            return {
              ...r,
              userCount,
              permissionIds: r.permissionIds || r.permissions?.map((p: any) => p.id) || [],
            };
          });

          setRoles(rolesWithData);
          setPermissions(fetchedPerms);
          setUsers(formattedUsers);
        }
      } catch (err) {
        console.error("Failed to fetch RBAC data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl bg-card border border-border" />
        <Skeleton className="h-64 w-full rounded-xl bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold">Access Control</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage roles, permissions, and user assignments
        </p>
      </div>

      {/* Stat Strip */}
      <div className="flex flex-wrap items-center gap-6 py-2 text-sm text-muted-foreground border-y border-border/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong className="text-foreground font-semibold">
              {roles.length}
            </strong>{" "}
            Roles Defined
          </span>
        </div>
        <div className="w-px h-4 bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong className="text-foreground font-semibold">
              {permissions.length}
            </strong>{" "}
            Permissions
          </span>
        </div>
        <div className="w-px h-4 bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong className="text-foreground font-semibold">
              {users.length}
            </strong>{" "}
            Users Managed
          </span>
        </div>
      </div>

      {/* Main Tabbed Client View */}
      <RBACPageClient
        roles={roles}
        permissions={permissions}
        users={users}
        currentUserId={currentUserId}
      />
    </div>
  );
}

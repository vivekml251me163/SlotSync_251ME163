"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RolesTable } from "./RolesTable";
import { UsersTable } from "./UsersTable";
import { RoleDialog, RoleItem, PermissionItem } from "./RoleDialog";
import { DeleteRoleDialog } from "./DeleteRoleDialog";
import { UserItem } from "./RoleAssignmentCell";

interface RBACPageClientProps {
  roles: RoleItem[];
  permissions: PermissionItem[];
  users: UserItem[];
  currentUserId: string;
}

export function RBACPageClient({
  roles,
  permissions,
  users,
  currentUserId,
}: RBACPageClientProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleItem | null>(null);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (role: RoleItem) => {
    setEditingRole(role);
  };

  const handleOpenDelete = (role: RoleItem) => {
    setDeletingRole(role);
  };

  const isRoleDialogOpen = createDialogOpen || !!editingRole;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="roles" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <TabsList className="bg-muted">
            <TabsTrigger value="roles" className="text-sm font-medium">
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="users" className="text-sm font-medium">
              User Assignments
            </TabsTrigger>
          </TabsList>

          <Button onClick={handleOpenCreate} size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Role
          </Button>
        </div>

        <TabsContent value="roles" className="mt-0 space-y-4">
          <RolesTable
            roles={roles}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </TabsContent>

        <TabsContent value="users" className="mt-0 space-y-4">
          <UsersTable
            users={users}
            allRoles={roles}
            currentUserId={currentUserId}
          />
        </TabsContent>
      </Tabs>

      {/* Create / Edit Dialog */}
      <RoleDialog
        open={isRoleDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingRole(null);
          }
        }}
        role={editingRole}
        permissions={permissions}
      />

      {/* Delete Dialog */}
      <DeleteRoleDialog
        open={!!deletingRole}
        onOpenChange={(open) => {
          if (!open) setDeletingRole(null);
        }}
        role={deletingRole}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RoleItem } from "./RoleDialog";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  createdAt: string;
  roleId: string | null;
  roleName: string | null;
}

interface RoleAssignmentCellProps {
  user: UserItem;
  allRoles: RoleItem[];
  currentUserId: string;
  onUserRoleUpdated: (userId: string, newRoleId: string, newRoleName: string) => void;
}

export function RoleAssignmentCell({
  user,
  allRoles,
  currentUserId,
  onUserRoleUpdated,
}: RoleAssignmentCellProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const isSelf = user.id === currentUserId;
  const currentRoleId = user.roleId || allRoles.find((r) => r.name.toUpperCase() === user.role.toUpperCase())?.id || "";
  const currentRoleName = user.roleName || user.role;

  if (isSelf) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border cursor-not-allowed">
              {currentRoleName}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">You cannot change your own role</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const handleRoleChange = async (newRoleId: string) => {
    const targetRole = allRoles.find((r) => r.id === newRoleId);
    if (!targetRole || newRoleId === currentRoleId) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/users/${user.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: newRoleId }),
      });

      if (!res.ok) {
        toast.error("Failed to update role. Try again.");
        setIsUpdating(false);
        return;
      }

      toast.success(`${user.name}'s role updated to ${targetRole.name}`);
      onUserRoleUpdated(user.id, targetRole.id, targetRole.name);
    } catch {
      toast.error("Failed to update role. Try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isUpdating) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground h-8">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        <span>Updating...</span>
      </div>
    );
  }

  return (
    <Select value={currentRoleId} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-[160px] h-8 text-xs bg-background">
        <SelectValue placeholder="Select Role">
          {currentRoleName}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        {allRoles.map((role) => (
          <SelectItem key={role.id} value={role.id} className="text-xs cursor-pointer">
            {role.name} {role.isDefault ? "(Default)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

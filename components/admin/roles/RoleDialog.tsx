"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface PermissionItem {
  id: string;
  name: string;
  description: string | null;
}

export interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  permissionIds?: string[];
  permissions: PermissionItem[];
  userCount: number;
}

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: RoleItem | null;
  permissions: PermissionItem[];
}

function formatPermissionName(name: string): string {
  return name
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function RoleDialog({
  open,
  onOpenChange,
  role,
  permissions,
}: RoleDialogProps) {
  const router = useRouter();
  const isEdit = !!role;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [nameError, setNameError] = useState("");
  const [permissionError, setPermissionError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (role) {
        setName(role.name);
        setDescription(role.description || "");
        setSelectedPermissions(
          role.permissionIds || role.permissions.map((p) => p.id)
        );
      } else {
        setName("");
        setDescription("");
        setSelectedPermissions([]);
      }
      setNameError("");
      setPermissionError(false);
    }
  }, [open, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;

    if (!name.trim()) {
      setNameError("Role name is required");
      isValid = false;
    } else {
      setNameError("");
    }

    if (selectedPermissions.length === 0) {
      setPermissionError(true);
      isValid = false;
    } else {
      setPermissionError(false);
    }

    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/roles/${role.id}` : "/api/roles";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          permissionIds: selectedPermissions,
        }),
      });

      if (res.status === 409) {
        setNameError("A role with this name already exists.");
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to save role");
        setIsSubmitting(false);
        return;
      }

      toast.success(isEdit ? "Role updated" : "Role created");
      router.refresh();
      onOpenChange(false);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "Edit Role" : "Create Role"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Role Name */}
          <div className="space-y-1.5">
            <Label htmlFor="role-name" className="text-sm font-medium">
              Role Name
            </Label>
            <Input
              id="role-name"
              placeholder="e.g. Lab Coordinator"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              disabled={isEdit && role?.isDefault}
              className={`bg-background ${
                nameError ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
            />
            {nameError && (
              <p className="text-xs text-destructive mt-1">{nameError}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="role-desc" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="role-desc"
              placeholder="Describe what this role can do."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none min-h-[80px] bg-background"
            />
          </div>

          {/* Permissions List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Permissions</Label>
            <p className="text-xs text-muted-foreground">Select what this role can do</p>
            <div className="grid grid-cols-1 gap-2 mt-2 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
              {permissions.map((permission) => {
                const isChecked = selectedPermissions.includes(permission.id);
                return (
                  <label
                    key={permission.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        if (permissionError) setPermissionError(false);
                        if (checked) {
                          setSelectedPermissions((prev) => [...prev, permission.id]);
                        } else {
                          setSelectedPermissions((prev) =>
                            prev.filter((id) => id !== permission.id)
                          );
                        }
                      }}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {formatPermissionName(permission.name)}
                      </p>
                      {permission.description && (
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            {permissionError && (
              <p className="text-xs text-destructive mt-1">
                Select at least one permission
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Role"
              ) : (
                "Create Role"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

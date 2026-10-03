"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RoleItem } from "./RoleDialog";

interface DeleteRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleItem | null;
}

export function DeleteRoleDialog({
  open,
  onOpenChange,
  role,
}: DeleteRoleDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!role) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/roles/${role.id}`, {
        method: "DELETE",
      });

      if (res.status === 409) {
        toast.error("Cannot delete — users are still assigned this role.");
        onOpenChange(false);
        setIsDeleting(false);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to delete role.");
        setIsDeleting(false);
        return;
      }

      toast.success("Role deleted");
      router.refresh();
      onOpenChange(false);
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border text-card-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl">
            Delete Role?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            This will permanently delete the{" "}
            <strong className="text-foreground">{role.name}</strong> role. Users
            assigned this role will need to be reassigned.
          </AlertDialogDescription>
          {role.userCount > 0 && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2.5 text-sm text-yellow-400 mt-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>"{role.userCount} user(s) are currently assigned this role."</span>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Role"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

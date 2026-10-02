"use client";

import { useState } from "react";
import { Facility } from "@/lib/db/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FacilityDialog } from "./FacilityDialog";
import { DeleteFacilityDialog } from "./DeleteFacilityDialog";
import { StatusChangeDialog } from "./StatusChangeDialog";
import { MoreHorizontal, Edit, CheckCircle, XCircle, Wrench, Trash2 } from "lucide-react";

interface FacilityRowActionsProps {
  facility: Facility;
  onRefresh: () => void;
  onToast: (message: string) => void;
}

export function FacilityRowActions({
  facility,
  onRefresh,
  onToast,
}: FacilityRowActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Status Change Dialog state
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>("");
  const [activeBookingsCount, setActiveBookingsCount] = useState<number>(0);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/facilities/${facility.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const resData = await res.json();

      if (res.status === 409 && resData.count) {
        setPendingStatus(newStatus);
        setActiveBookingsCount(resData.count);
        setIsStatusDialogOpen(true);
      } else if (!res.ok) {
        onToast(resData.error || "Failed to update facility status.");
      } else {
        onToast(`Facility status updated to ${newStatus.replace("_", " ")}.`);
        onRefresh();
      }
    } catch {
      onToast("An error occurred while updating facility status.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card border-border w-48">
          <DropdownMenuItem
            onClick={() => setIsEditDialogOpen(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
            <span>Edit Facility</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border" />

          {facility.status !== "AVAILABLE" && (
            <DropdownMenuItem
              onClick={() => handleUpdateStatus("AVAILABLE")}
              className="flex items-center gap-2 cursor-pointer text-emerald-400 focus:text-emerald-400"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Set Available</span>
            </DropdownMenuItem>
          )}

          {facility.status !== "UNAVAILABLE" && (
            <DropdownMenuItem
              onClick={() => handleUpdateStatus("UNAVAILABLE")}
              className="flex items-center gap-2 cursor-pointer text-rose-400 focus:text-rose-400"
            >
              <XCircle className="h-4 w-4" />
              <span>Set Unavailable</span>
            </DropdownMenuItem>
          )}

          {facility.status !== "UNDER_MAINTENANCE" && (
            <DropdownMenuItem
              onClick={() => handleUpdateStatus("UNDER_MAINTENANCE")}
              className="flex items-center gap-2 cursor-pointer text-purple-400 focus:text-purple-400"
            >
              <Wrench className="h-4 w-4" />
              <span>Set Maintenance</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-border" />

          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Facility</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Facility Dialog */}
      <FacilityDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        facility={facility}
        onSuccess={() => {
          onRefresh();
          onToast("Facility updated successfully.");
        }}
      />

      {/* Delete Facility Dialog */}
      <DeleteFacilityDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        facilityId={facility.id}
        facilityName={facility.name}
        onSuccess={() => {
          onRefresh();
          onToast("Facility deleted successfully.");
        }}
        onErrorToast={onToast}
      />

      {/* Status Change Confirmation Dialog */}
      <StatusChangeDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        facilityId={facility.id}
        targetStatus={pendingStatus}
        activeCount={activeBookingsCount}
        onSuccess={() => {
          onRefresh();
          onToast(`Facility status updated to ${pendingStatus.replace("_", " ")}.`);
        }}
        onErrorToast={onToast}
      />
    </>
  );
}

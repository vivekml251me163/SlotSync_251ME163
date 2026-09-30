"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Facility } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FacilityForm } from "./FacilityForm";

interface FacilityActionsProps {
  facility: Facility;
}

export function FacilityActions({ facility }: FacilityActionsProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${facility.name}?`)) {
      return;
    }

    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/facilities/${facility.id}`, {
        method: "DELETE",
      });

      const resData = await res.json();

      if (!res.ok) {
        setErrorMsg(resData.error || "Failed to delete facility");
      } else {
        router.refresh();
      }
    } catch {
      setErrorMsg("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {errorMsg && (
        <span className="text-xs text-red-600 mr-2 font-medium">{errorMsg}</span>
      )}
      <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
        Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        disabled={isDeleting}
        onClick={handleDelete}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Facility - {facility.name}</DialogTitle>
          </DialogHeader>
          <FacilityForm
            facility={facility}
            onSuccess={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

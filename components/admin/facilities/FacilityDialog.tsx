"use client";

import { useState, useEffect } from "react";
import { Facility } from "@/lib/db/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";

interface FacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facility?: Facility | null;
  onSuccess: () => void;
}

export function FacilityDialog({
  open,
  onOpenChange,
  facility,
  onSuccess,
}: FacilityDialogProps) {
  const isEdit = !!facility;

  const [formData, setFormData] = useState({
    name: "",
    type: "classroom",
    location: "",
    capacity: 30,
    openingTime: "08:00",
    closingTime: "20:00",
    status: "AVAILABLE",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name,
        type: facility.type,
        location: facility.location,
        capacity: facility.capacity,
        openingTime: facility.openingTime,
        closingTime: facility.closingTime,
        status: facility.status,
      });
    } else {
      setFormData({
        name: "",
        type: "classroom",
        location: "",
        capacity: 30,
        openingTime: "08:00",
        closingTime: "20:00",
        status: "AVAILABLE",
      });
    }
    setErrorMsg(null);
  }, [facility, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const url = isEdit ? `/api/facilities/${facility.id}` : "/api/facilities";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          capacity: Number(formData.capacity),
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setErrorMsg(resData.error || "Failed to save facility.");
      } else {
        onSuccess();
        onOpenChange(false);
      }
    } catch {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-foreground">
            {isEdit ? "Edit Facility" : "Add Facility"}
          </DialogTitle>
        </DialogHeader>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Row 1: Name */}
          <div className="space-y-1.5">
            <Label htmlFor="facility-name">Facility Name</Label>
            <Input
              id="facility-name"
              required
              placeholder="e.g. Main Seminar Hall A"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-background border-border focus-visible:ring-primary/50"
            />
          </div>

          {/* Row 2: Type + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="facility-type">Facility Type</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger id="facility-type" className="bg-background border-border">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classroom">Classroom</SelectItem>
                  <SelectItem value="seminar_hall">Seminar Hall</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="facility-location">Location</Label>
              <Input
                id="facility-location"
                required
                placeholder="e.g. LHC-102"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-background border-border focus-visible:ring-primary/50"
              />
            </div>
          </div>

          {/* Row 3: Capacity + Status (Edit mode) */}
          <div className={`grid ${isEdit ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
            <div className="space-y-1.5">
              <Label htmlFor="facility-capacity">Capacity (Seats)</Label>
              <Input
                id="facility-capacity"
                type="number"
                min={1}
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="bg-background border-border focus-visible:ring-primary/50"
              />
            </div>

            {isEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="facility-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger id="facility-status" className="bg-background border-border">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                    <SelectItem value="UNDER_MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Row 4: Opening & Closing Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="facility-opening">Opening Time</Label>
              <Input
                id="facility-opening"
                type="time"
                required
                value={formData.openingTime}
                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                className="bg-background border-border [color-scheme:dark] focus-visible:ring-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="facility-closing">Closing Time</Label>
              <Input
                id="facility-closing"
                type="time"
                required
                value={formData.closingTime}
                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                className="bg-background border-border [color-scheme:dark] focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? "Save Changes" : "Create Facility"}</span>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

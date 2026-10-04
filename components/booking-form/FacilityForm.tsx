"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createFacilitySchema, updateFacilitySchema } from "@/lib/validations";
import { Facility } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface FacilityFormProps {
  facility?: Facility;
  onSuccess?: () => void;
}

const inputCls =
  "flex h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-all duration-200 placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50";

const selectCls =
  "flex h-10 w-full rounded-lg border border-white/[0.08] bg-[#0d0d14] px-3 py-2 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50";

const labelCls = "text-xs font-medium text-muted-foreground uppercase tracking-wide";

export function FacilityForm({ facility, onSuccess }: FacilityFormProps) {
  const router = useRouter();
  const isEdit = !!facility;
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const schema = isEdit ? updateFacilitySchema : createFacilitySchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: facility
      ? {
          name: facility.name,
          type: facility.type as "classroom" | "seminar_hall" | "lab" | "sports",
          location: facility.location,
          capacity: facility.capacity,
          openingTime: facility.openingTime,
          closingTime: facility.closingTime,
          status: facility.status as "AVAILABLE" | "UNAVAILABLE" | "UNDER_MAINTENANCE",
        }
      : {
          name: "",
          type: "classroom" as const,
          location: "",
          capacity: 10,
          openingTime: "08:00",
          closingTime: "18:00",
        },
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    setServerError(null);
    setIsLoading(true);
    try {
      const url = isEdit ? `/api/facilities/${facility.id}` : "/api/facilities";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        if (res.status === 409 && resData.count) {
          setServerError(
            `${resData.error || "Cannot change status"}. Active bookings: ${resData.count}`
          );
        } else {
          setServerError(resData.error || "Failed to save facility.");
        }
      } else {
        router.refresh();
        onSuccess?.();
      }
    } catch {
      setServerError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/[0.08] px-4 py-3 text-sm text-destructive/90">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <Label className={labelCls}>Facility Name</Label>
        <Input {...register("name")} placeholder="e.g. Main Auditorium" />
        {errors.name && <p className="text-xs text-destructive/90">{errors.name.message as string}</p>}
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <Label className={labelCls}>Type</Label>
        <select {...register("type")} className={selectCls}>
          <option value="classroom">Classroom</option>
          <option value="seminar_hall">Seminar Hall</option>
          <option value="lab">Lab</option>
          <option value="sports">Sports Complex</option>
        </select>
        {errors.type && <p className="text-xs text-destructive/90">{errors.type.message as string}</p>}
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label className={labelCls}>Location</Label>
        <Input {...register("location")} placeholder="e.g. Building A, 2nd Floor" />
        {errors.location && <p className="text-xs text-destructive/90">{errors.location.message as string}</p>}
      </div>

      {/* Capacity */}
      <div className="space-y-1.5">
        <Label className={labelCls}>Capacity</Label>
        <Input type="number" {...register("capacity", { valueAsNumber: true })} placeholder="50" />
        {errors.capacity && <p className="text-xs text-destructive/90">{errors.capacity.message as string}</p>}
      </div>

      {/* Opening / Closing Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className={labelCls}>Opening Time</Label>
          <input type="time" {...register("openingTime")} className={inputCls} />
          {errors.openingTime && <p className="text-xs text-destructive/90">{errors.openingTime.message as string}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Closing Time</Label>
          <input type="time" {...register("closingTime")} className={inputCls} />
          {errors.closingTime && <p className="text-xs text-destructive/90">{errors.closingTime.message as string}</p>}
        </div>
      </div>

      {/* Status (edit-only) */}
      {isEdit && (
        <div className="space-y-1.5">
          <Label className={labelCls}>Status</Label>
          <select {...register("status")} className={selectCls}>
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
          </select>
          {(errors as Record<string, any>).status && (
            <p className="text-xs text-destructive/90">{(errors as Record<string, any>).status?.message as string}</p>
          )}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Facility" : "Create Facility"}
        </Button>
      </div>
    </form>
  );
}

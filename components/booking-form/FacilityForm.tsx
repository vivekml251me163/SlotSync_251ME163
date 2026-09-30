"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createFacilitySchema, updateFacilitySchema } from "@/lib/validations";
import { Facility } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";

interface FacilityFormProps {
  facility?: Facility;
  onSuccess?: () => void;
}

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
            `${resData.error || "Cannot change status"}. Active bookings count: ${resData.count}`
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
        <div className="rounded border border-red-400 bg-red-100 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Facility Name</label>
        <input
          type="text"
          {...register("name")}
          className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="e.g. Main Auditorium"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          {...register("type")}
          className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="classroom">Classroom</option>
          <option value="seminar_hall">Seminar Hall</option>
          <option value="lab">Lab</option>
          <option value="sports">Sports Complex</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-xs text-red-500">{errors.type.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          {...register("location")}
          className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="e.g. Building A, 2nd Floor"
        />
        {errors.location && (
          <p className="mt-1 text-xs text-red-500">{errors.location.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Capacity</label>
        <input
          type="number"
          {...register("capacity", { valueAsNumber: true })}
          className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="50"
        />
        {errors.capacity && (
          <p className="mt-1 text-xs text-red-500">{errors.capacity.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Opening Time</label>
          <input
            type="time"
            {...register("openingTime")}
            className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.openingTime && (
            <p className="mt-1 text-xs text-red-500">{errors.openingTime.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Closing Time</label>
          <input
            type="time"
            {...register("closingTime")}
            className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.closingTime && (
            <p className="mt-1 text-xs text-red-500">{errors.closingTime.message as string}</p>
          )}
        </div>
      </div>

      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            {...register("status")}
            className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
          </select>
          {(errors as Record<string, any>).status && (
            <p className="mt-1 text-xs text-red-500">
              {(errors as Record<string, any>).status?.message as string}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Facility" : "Create Facility"}
        </Button>
      </div>
    </form>
  );
}

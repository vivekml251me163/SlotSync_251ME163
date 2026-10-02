import { z } from "zod";

export const userRoleSchema = z.enum(["ADMIN", "FACULTY", "CONVENOR", "STUDENT"]);

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: userRoleSchema.default("STUDENT"),
  department: z.string().optional(),
});

export const facilityTypeSchema = z.enum([
  "classroom",
  "seminar_hall",
  "lab",
  "sports",
]);

export const facilityStatusSchema = z.enum([
  "AVAILABLE",
  "UNAVAILABLE",
  "UNDER_MAINTENANCE",
]);

export const facilityBaseSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(100),
  type: facilityTypeSchema,
  location: z.string().min(2, { message: "Location must be at least 2 characters" }),
  capacity: z.number().int({ message: "Capacity must be an integer" }).positive({ message: "Capacity must be a positive integer" }),
  openingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "Must be HH:MM format (24-hour)" }),
  closingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "Must be HH:MM format (24-hour)" }),
});

export const createFacilitySchema = facilityBaseSchema.refine(
  (d) => d.openingTime < d.closingTime,
  {
    message: "closingTime must be after openingTime",
    path: ["closingTime"],
  }
);

export const updateFacilitySchema = facilityBaseSchema
  .partial()
  .extend({
    status: facilityStatusSchema.optional(),
  })
  .refine(
    (d) => {
      if (d.openingTime && d.closingTime) {
        return d.openingTime < d.closingTime;
      }
      return true;
    },
    {
      message: "closingTime must be after openingTime",
      path: ["closingTime"],
    }
  );

export const bookingStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]);

export const bookingSchema = z.object({
  facilityId: z.string().min(1, { message: "Invalid facility ID" }),
  title: z.string().min(1, { message: "Title is required" }),
  purpose: z.string().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

export const createBookingSchema = z
  .object({
    facilityId: z.string().min(1, { message: "Facility ID is required" }),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be YYYY-MM-DD" }),
    slotStart: z.string().datetime(),
    slotEnd: z.string().datetime(),
  })
  .refine(
    (d) => {
      const start = new Date(d.slotStart);
      const end = new Date(d.slotEnd);
      const diffHours = (end.getTime() - start.getTime()) / 36e5;
      return diffHours === 1;
    },
    { message: "Slot must be exactly 1 hour", path: ["slotEnd"] }
  )
  .refine(
    (d) => {
      const selectedDate = new Date(d.date + "T00:00:00");
      const today = new Date(new Date().toDateString());
      return selectedDate >= today;
    },
    { message: "Cannot book in the past", path: ["date"] }
  );

export const updateBookingSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("REQUEST_CANCELLATION"), cancelReason: z.string().min(10, { message: "Cancellation reason must be at least 10 characters" }) }),
  z.object({ action: z.literal("CANCEL") }),
  z.object({ action: z.literal("APPROVE") }),
  z.object({ action: z.literal("REJECT"), rejectionReason: z.string().min(10, { message: "Rejection reason must be at least 10 characters" }) }),
  z.object({ action: z.literal("APPROVE_CANCELLATION") }),
  z.object({ action: z.literal("REJECT_CANCELLATION") }),
]);

export const joinWaitlistSchema = z
  .object({
    facilityId: z.string().min(1, { message: "Facility ID is required" }),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be YYYY-MM-DD" }),
    slotStart: z.string().datetime(),
  })
  .refine(
    (d) => {
      const selectedDate = new Date(d.date + "T00:00:00");
      const today = new Date(new Date().toDateString());
      return selectedDate >= today;
    },
    { message: "Cannot join waitlist for past date", path: ["date"] }
  );

export const availabilitySchema = z.object({
  facilityId: z.string().min(1),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:mm format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:mm format"),
  isAvailable: z.boolean().default(true),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;

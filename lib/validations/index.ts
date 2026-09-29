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
  "AUDITORIUM",
  "LAB",
  "SEMINAR_HALL",
  "CLASSROOM",
  "SPORTS_COMPLEX",
  "MEETING_ROOM",
]);

export const facilitySchema = z.object({
  name: z.string().min(1, { message: "Facility name is required" }),
  code: z.string().min(1, { message: "Facility code is required" }),
  description: z.string().optional(),
  type: facilityTypeSchema,
  capacity: z.number().int().positive({ message: "Capacity must be a positive integer" }),
  location: z.string().min(1, { message: "Location is required" }),
  isActive: z.boolean().default(true),
});

export const bookingStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]);

export const bookingSchema = z.object({
  facilityId: z.string().uuid({ message: "Invalid facility ID" }),
  title: z.string().min(1, { message: "Title is required" }),
  purpose: z.string().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

export const availabilitySchema = z.object({
  facilityId: z.string().uuid(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:mm format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:mm format"),
  isAvailable: z.boolean().default(true),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type FacilityInput = z.infer<typeof facilitySchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;

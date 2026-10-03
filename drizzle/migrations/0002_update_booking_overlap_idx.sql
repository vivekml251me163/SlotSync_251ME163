DROP INDEX IF EXISTS "booking_overlap_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "booking_overlap_idx" ON "bookings" USING btree ("facility_id", "date", "slot_start") WHERE status = 'APPROVED';

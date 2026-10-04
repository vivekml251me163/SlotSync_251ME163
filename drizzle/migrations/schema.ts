import { pgTable, unique, text, timestamp, integer, varchar, foreignKey, index, uniqueIndex, date, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const bookingStatus = pgEnum("booking_status", ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CANCELLATION_REQUESTED'])
export const facilityStatus = pgEnum("facility_status", ['AVAILABLE', 'UNAVAILABLE', 'UNDER_MAINTENANCE'])
export const role = pgEnum("role", ['ADMIN', 'FACULTY', 'CONVENOR', 'STUDENT'])


export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	role: role().default('STUDENT').notNull(),
	department: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const facilities = pgTable("facilities", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull(),
	location: text().notNull(),
	capacity: integer().notNull(),
	openingTime: varchar("opening_time", { length: 5 }).notNull(),
	closingTime: varchar("closing_time", { length: 5 }).notNull(),
	status: facilityStatus().default('AVAILABLE').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const penalties = pgTable("penalties", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	restrictedUntil: timestamp("restricted_until", { mode: 'string' }).notNull(),
	reason: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "penalties_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const waitlist = pgTable("waitlist", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	facilityId: text("facility_id").notNull(),
	date: date().notNull(),
	slotStart: timestamp("slot_start", { mode: 'string' }).notNull(),
	position: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("waitlist_position_idx").using("btree", table.facilityId.asc().nullsLast().op("date_ops"), table.date.asc().nullsLast().op("timestamp_ops"), table.slotStart.asc().nullsLast().op("text_ops"), table.position.asc().nullsLast().op("timestamp_ops")),
	uniqueIndex("waitlist_user_slot_idx").using("btree", table.facilityId.asc().nullsLast().op("text_ops"), table.date.asc().nullsLast().op("date_ops"), table.slotStart.asc().nullsLast().op("timestamp_ops"), table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "waitlist_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.facilityId],
			foreignColumns: [facilities.id],
			name: "waitlist_facility_id_facilities_id_fk"
		}).onDelete("cascade"),
]);

export const bookings = pgTable("bookings", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	facilityId: text("facility_id").notNull(),
	date: date().notNull(),
	slotStart: timestamp("slot_start", { mode: 'string' }).notNull(),
	slotEnd: timestamp("slot_end", { mode: 'string' }).notNull(),
	status: bookingStatus().default('PENDING').notNull(),
	rejectionReason: text("rejection_reason"),
	cancelReason: text("cancel_reason"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	promotedFromWaitlist: boolean("promoted_from_waitlist").default(false).notNull(),
}, (table) => [
	uniqueIndex("booking_overlap_idx").using("btree", table.facilityId.asc().nullsLast().op("text_ops"), table.date.asc().nullsLast().op("timestamp_ops"), table.slotStart.asc().nullsLast().op("timestamp_ops")).where(sql`(status = 'APPROVED'::booking_status)`),
	index("booking_user_date_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.date.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "bookings_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.facilityId],
			foreignColumns: [facilities.id],
			name: "bookings_facility_id_facilities_id_fk"
		}).onDelete("cascade"),
]);

export const permissions = pgTable("permissions", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("permissions_name_unique").on(table.name),
]);

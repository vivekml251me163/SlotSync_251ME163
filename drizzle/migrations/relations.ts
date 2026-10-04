import { relations } from "drizzle-orm/relations";
import { users, penalties, waitlist, facilities, bookings } from "./schema";

export const penaltiesRelations = relations(penalties, ({one}) => ({
	user: one(users, {
		fields: [penalties.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	penalties: many(penalties),
	waitlists: many(waitlist),
	bookings: many(bookings),
}));

export const waitlistRelations = relations(waitlist, ({one}) => ({
	user: one(users, {
		fields: [waitlist.userId],
		references: [users.id]
	}),
	facility: one(facilities, {
		fields: [waitlist.facilityId],
		references: [facilities.id]
	}),
}));

export const facilitiesRelations = relations(facilities, ({many}) => ({
	waitlists: many(waitlist),
	bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({one}) => ({
	user: one(users, {
		fields: [bookings.userId],
		references: [users.id]
	}),
	facility: one(facilities, {
		fields: [bookings.facilityId],
		references: [facilities.id]
	}),
}));
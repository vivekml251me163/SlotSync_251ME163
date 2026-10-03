import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  varchar,
  date,
  uniqueIndex,
  index,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// Enums
export const roleEnum = pgEnum("role", ["ADMIN", "FACULTY", "CONVENOR", "STUDENT"]);
export const facilityStatusEnum = pgEnum("facility_status", [
  "AVAILABLE",
  "UNAVAILABLE",
  "UNDER_MAINTENANCE",
]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "CANCELLATION_REQUESTED",
]);

// Users Table
export const users = pgTable("users", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default("STUDENT").notNull(),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Facilities Table
export const facilities = pgTable("facilities", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull(),
  openingTime: varchar("opening_time", { length: 5 }).notNull(), // "HH:MM"
  closingTime: varchar("closing_time", { length: 5 }).notNull(), // "HH:MM"
  status: facilityStatusEnum("status").default("AVAILABLE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bookings Table
export const bookings = pgTable(
  "bookings",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    facilityId: text("facility_id")
      .references(() => facilities.id, { onDelete: "cascade" })
      .notNull(),
    date: date("date").notNull(),
    slotStart: timestamp("slot_start").notNull(),
    slotEnd: timestamp("slot_end").notNull(),
    status: bookingStatusEnum("status").default("PENDING").notNull(),
    rejectionReason: text("rejection_reason"),
    cancelReason: text("cancel_reason"),
    promotedFromWaitlist: boolean("promoted_from_waitlist").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    bookingOverlapIdx: uniqueIndex("booking_overlap_idx")
      .on(table.facilityId, table.date, table.slotStart)
      .where(sql`status = 'APPROVED'`),
    bookingUserDateIdx: index("booking_user_date_idx").on(table.userId, table.date),
  })
);

// Waitlist Table
export const waitlist = pgTable(
  "waitlist",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    facilityId: text("facility_id")
      .references(() => facilities.id, { onDelete: "cascade" })
      .notNull(),
    date: date("date").notNull(),
    slotStart: timestamp("slot_start").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    waitlistUserSlotIdx: uniqueIndex("waitlist_user_slot_idx").on(
      table.facilityId,
      table.date,
      table.slotStart,
      table.userId
    ),
    waitlistPositionIdx: index("waitlist_position_idx").on(
      table.facilityId,
      table.date,
      table.slotStart,
      table.position
    ),
  })
);

// Penalties Table
export const penalties = pgTable("penalties", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  restrictedUntil: timestamp("restricted_until").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RBAC: Permissions Table
export const permissions = pgTable("permissions", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RBAC: Roles Table
export const roles = pgTable("roles", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RBAC: Role Permissions Join Table
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: text("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
    permissionId: text("permission_id")
      .references(() => permissions.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  })
);

// RBAC: User Roles Join Table
export const userRoles = pgTable(
  "user_roles",
  {
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    roleId: text("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  waitlist: many(waitlist),
  penalties: many(penalties),
  userRoles: many(userRoles),
}));

export const facilitiesRelations = relations(facilities, ({ many }) => ({
  bookings: many(bookings),
  waitlist: many(waitlist),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  facility: one(facilities, {
    fields: [bookings.facilityId],
    references: [facilities.id],
  }),
}));

export const waitlistRelations = relations(waitlist, ({ one }) => ({
  user: one(users, {
    fields: [waitlist.userId],
    references: [users.id],
  }),
  facility: one(facilities, {
    fields: [waitlist.facilityId],
    references: [facilities.id],
  }),
}));

export const penaltiesRelations = relations(penalties, ({ one }) => ({
  user: one(users, {
    fields: [penalties.userId],
    references: [users.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

// TypeScript Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Facility = typeof facilities.$inferSelect;
export type NewFacility = typeof facilities.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Waitlist = typeof waitlist.$inferSelect;
export type NewWaitlist = typeof waitlist.$inferInsert;
export type Penalty = typeof penalties.$inferSelect;
export type NewPenalty = typeof penalties.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type UserRoleRelation = typeof userRoles.$inferSelect;

export type UserRole = "ADMIN" | "FACULTY" | "CONVENOR" | "STUDENT";

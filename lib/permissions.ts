import { UserRole } from "@/lib/db/schema";

export type Action =
  | "create:facility"
  | "update:facility"
  | "delete:facility"
  | "view:facility"
  | "create:booking"
  | "approve:booking"
  | "reject:booking"
  | "cancel:own_booking"
  | "cancel:any_booking"
  | "view:all_bookings"
  | "view:own_bookings"
  | "manage:users";

export const ROLE_PERMISSIONS: Record<UserRole, Action[]> = {
  ADMIN: [
    "create:facility",
    "update:facility",
    "delete:facility",
    "view:facility",
    "create:booking",
    "approve:booking",
    "reject:booking",
    "cancel:own_booking",
    "cancel:any_booking",
    "view:all_bookings",
    "view:own_bookings",
    "manage:users",
  ],
  FACULTY: [
    "view:facility",
    "create:booking",
    "approve:booking",
    "reject:booking",
    "cancel:own_booking",
    "view:all_bookings",
    "view:own_bookings",
  ],
  CONVENOR: [
    "view:facility",
    "create:booking",
    "approve:booking",
    "reject:booking",
    "cancel:own_booking",
    "view:all_bookings",
    "view:own_bookings",
  ],
  STUDENT: [
    "view:facility",
    "create:booking",
    "cancel:own_booking",
    "view:own_bookings",
  ],
};

export const ROLE_ROUTE_PREFIXES: Record<UserRole, string[]> = {
  ADMIN: ["/admin", "/faculty", "/student"],
  FACULTY: ["/faculty", "/student"],
  CONVENOR: ["/faculty", "/student"],
  STUDENT: ["/student"],
};

export function hasPermission(role: UserRole, action: Action): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/admin")) {
    return role === "ADMIN";
  }
  if (pathname.startsWith("/faculty")) {
    return role === "FACULTY" || role === "CONVENOR" || role === "ADMIN";
  }
  if (pathname.startsWith("/student")) {
    return ["STUDENT", "FACULTY", "CONVENOR", "ADMIN"].includes(role);
  }
  return true;
}

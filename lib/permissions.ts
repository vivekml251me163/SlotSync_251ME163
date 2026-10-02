import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Session } from "next-auth";
import { roleEnum } from "@/lib/db/schema";

export type Role = typeof roleEnum.enumValues[number];

// Role Constants
export const ADMIN: Role[] = ["ADMIN"];
export const FACULTY_OR_ABOVE: Role[] = ["ADMIN", "FACULTY", "CONVENOR"];
export const ALL_AUTHENTICATED: Role[] = ["ADMIN", "FACULTY", "CONVENOR", "STUDENT"];

/**
 * Returns boolean — use inside Server Components for conditional rendering
 */
export function hasRole(role: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(role);
}

/**
 * Throws 401 response if no session, 403 response if role not in allowedRoles.
 * Returns session.user if authorized.
 */
export async function requireRole(
  allowedRoles: Role[]
): Promise<Session["user"] | NextResponse> {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(session.user.role, allowedRoles)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return session.user;
}

/**
 * DB-driven permission check using permissions, rolePermissions, and userRoles tables.
 */
export async function requirePermission(
  permissionName: string
): Promise<Session["user"] | NextResponse> {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "ADMIN") {
    return session.user;
  }

  try {
    const { db } = await import("@/lib/db");
    const { permissions, rolePermissions, userRoles } = await import("@/lib/db/schema");
    const { and, eq } = await import("drizzle-orm");

    const userPerms = await db
      .select({ name: permissions.name })
      .from(permissions)
      .innerJoin(rolePermissions, eq(permissions.id, rolePermissions.permissionId))
      .innerJoin(userRoles, eq(rolePermissions.roleId, userRoles.roleId))
      .where(and(eq(userRoles.userId, session.user.id), eq(permissions.name, permissionName)))
      .limit(1);

    if (userPerms.length === 0) {
      return NextResponse.json({ error: "Forbidden: Missing permission" }, { status: 403 });
    }

    return session.user;
  } catch (error) {
    console.error("Error in requirePermission:", error);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

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

export const ROLE_PERMISSIONS: Record<Role, Action[]> = {
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

export const ROLE_ROUTE_PREFIXES: Record<Role, string[]> = {
  ADMIN: ["/admin", "/faculty", "/student"],
  FACULTY: ["/faculty", "/student"],
  CONVENOR: ["/faculty", "/student"],
  STUDENT: ["/student"],
};

export function hasPermission(role: Role, action: Action): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}

export function canAccessRoute(role: Role, pathname: string): boolean {
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

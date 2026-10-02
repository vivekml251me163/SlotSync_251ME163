import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, roles, userRoles } from "@/lib/db/schema";
import { requirePermission } from "@/lib/permissions";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const authResult = await requirePermission("manage_roles");
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleEnum: users.role,
        department: users.department,
        createdAt: users.createdAt,
        roleId: userRoles.roleId,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(userRoles, eq(users.id, userRoles.userId))
      .leftJoin(roles, eq(userRoles.roleId, roles.id));

    return NextResponse.json(allUsers, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

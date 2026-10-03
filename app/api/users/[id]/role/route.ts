import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, roles, userRoles } from "@/lib/db/schema";
import { requirePermission } from "@/lib/permissions";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateUserRoleSchema = z.object({
  roleId: z.string().min(1),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission("manage_roles");
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id: userId } = await params;

    const [targetUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const validation = updateUserRoleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { roleId } = validation.data;

    const [targetRole] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    if (!targetRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Map role name to roleEnum for JWT session compatibility
    let mappedRoleEnum: "ADMIN" | "FACULTY" | "CONVENOR" | "STUDENT" = "STUDENT";
    const uppercaseRoleName = targetRole.name.toUpperCase();

    if (uppercaseRoleName === "ADMIN") mappedRoleEnum = "ADMIN";
    else if (uppercaseRoleName === "FACULTY") mappedRoleEnum = "FACULTY";
    else if (uppercaseRoleName === "CONVENOR") mappedRoleEnum = "CONVENOR";

    await db.transaction(async (tx) => {
      // 1. Delete existing userRoles
      await tx.delete(userRoles).where(eq(userRoles.userId, userId));

      // 2. Insert new userRoles
      await tx.insert(userRoles).values({
        userId,
        roleId,
      });

      // 3. Update users.role enum to keep auth JWT in sync
      await tx
        .update(users)
        .set({ role: mappedRoleEnum })
        .where(eq(users.id, userId));
    });

    return NextResponse.json(
      { message: "User role updated successfully", role: targetRole.name },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/users/[id]/role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

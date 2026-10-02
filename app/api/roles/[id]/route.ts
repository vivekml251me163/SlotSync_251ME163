import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles, rolePermissions, userRoles } from "@/lib/db/schema";
import { requirePermission } from "@/lib/permissions";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateRoleSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requirePermission("manage_roles");
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = params;

    const [existingRole] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const body = await req.json();
    const validation = updateRoleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, permissionIds } = validation.data;

    await db.transaction(async (tx) => {
      // 1. Update role metadata if provided
      if (name || description !== undefined) {
        await tx
          .update(roles)
          .set({
            ...(name ? { name: name.toUpperCase() } : {}),
            ...(description !== undefined ? { description } : {}),
          })
          .where(eq(roles.id, id));
      }

      // 2. Replace permissions if provided
      if (permissionIds) {
        await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, id));

        if (permissionIds.length > 0) {
          await tx.insert(rolePermissions).values(
            permissionIds.map((pId) => ({
              roleId: id,
              permissionId: pId,
            }))
          );
        }
      }
    });

    return NextResponse.json({ message: "Role updated successfully" }, { status: 200 });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === "23505" || String(err?.message).includes("unique constraint")) {
      return NextResponse.json({ error: "Role name already exists" }, { status: 409 });
    }
    console.error("Error in PATCH /api/roles/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requirePermission("manage_roles");
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = params;

    const [existingRole] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // 1. Block if isDefault === true
    if (existingRole.isDefault) {
      return NextResponse.json({ error: "Default role cannot be deleted" }, { status: 403 });
    }

    // 2. Block if assigned to active users
    const assignedUsers = await db
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .where(eq(userRoles.roleId, id))
      .limit(1);

    if (assignedUsers.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete role assigned to active users" },
        { status: 409 }
      );
    }

    // 3. Hard delete role (cascade deletes rolePermissions)
    await db.delete(roles).where(eq(roles.id, id));

    return NextResponse.json({ message: "Role deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/roles/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

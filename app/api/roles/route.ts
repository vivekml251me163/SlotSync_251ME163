import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles, permissions, rolePermissions } from "@/lib/db/schema";
import { requirePermission } from "@/lib/permissions";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).min(1, "Select at least one permission"),
});

export async function GET() {
  try {
    const authResult = await requirePermission("manage_roles");
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const allRoles = await db.select().from(roles);
    const allPerms = await db.select().from(permissions);
    const allRolePerms = await db.select().from(rolePermissions);

    const rolesWithPermissions = allRoles.map((r) => {
      const assignedPermIds = allRolePerms
        .filter((rp) => rp.roleId === r.id)
        .map((rp) => rp.permissionId);

      const assignedPermissions = allPerms.filter((p) => assignedPermIds.includes(p.id));

      return {
        ...r,
        permissions: assignedPermissions,
        permissionIds: assignedPermIds,
      };
    });

    return NextResponse.json(
      {
        roles: rolesWithPermissions,
        allPermissions: allPerms,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/roles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission("manage_roles");
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await req.json();
    const validation = createRoleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, permissionIds } = validation.data;

    // Check unique name
    const existing = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Role name already exists" }, { status: 409 });
    }

    const newRole = await db.transaction(async (tx) => {
      const [insertedRole] = await tx
        .insert(roles)
        .values({
          name: name.toUpperCase(),
          description: description || null,
          isDefault: false,
        })
        .returning();

      if (permissionIds.length > 0) {
        await tx.insert(rolePermissions).values(
          permissionIds.map((pId) => ({
            roleId: insertedRole.id,
            permissionId: pId,
          }))
        );
      }

      return insertedRole;
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === "23505" || String(err?.message).includes("unique constraint")) {
      return NextResponse.json({ error: "Role name already exists" }, { status: 409 });
    }
    console.error("Error in POST /api/roles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

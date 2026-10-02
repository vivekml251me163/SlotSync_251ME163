import { db } from "@/lib/db";
import { permissions, roles, rolePermissions, userRoles, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function seedRbac() {
  console.log("Seeding RBAC permissions and default roles...");

  const defaultPermissions = [
    { name: "view_facilities", description: "View list and details of facilities" },
    { name: "book_facility", description: "Request slot bookings" },
    { name: "cancel_booking", description: "Cancel own booking requests" },
    { name: "approve_booking", description: "Approve or reject booking requests" },
    { name: "manage_facilities", description: "Create, update, or set maintenance for facilities" },
    { name: "view_analytics", description: "Access admin analytics dashboard" },
    { name: "manage_roles", description: "Manage roles and user permissions" },
  ];

  // 1. Insert permissions if missing
  const permissionMap: Record<string, string> = {};
  for (const perm of defaultPermissions) {
    const existing = await db
      .select()
      .from(permissions)
      .where(eq(permissions.name, perm.name))
      .limit(1);

    if (existing.length > 0) {
      permissionMap[perm.name] = existing[0].id;
    } else {
      const [inserted] = await db.insert(permissions).values(perm).returning();
      permissionMap[perm.name] = inserted.id;
    }
  }

  // 2. Insert default roles
  const defaultRolesConfig = [
    {
      name: "ADMIN",
      description: "Administrator role with full system permissions",
      isDefault: true,
      perms: [
        "view_facilities",
        "book_facility",
        "cancel_booking",
        "approve_booking",
        "manage_facilities",
        "view_analytics",
        "manage_roles",
      ],
    },
    {
      name: "FACULTY",
      description: "Faculty member with booking and approval rights",
      isDefault: true,
      perms: ["view_facilities", "book_facility", "cancel_booking", "approve_booking"],
    },
    {
      name: "CONVENOR",
      description: "Club or event convenor with booking rights",
      isDefault: true,
      perms: ["view_facilities", "book_facility", "cancel_booking"],
    },
    {
      name: "STUDENT",
      description: "Student role with basic view and request rights",
      isDefault: true,
      perms: ["view_facilities"],
    },
  ];

  const roleMap: Record<string, string> = {};

  for (const r of defaultRolesConfig) {
    let roleId: string;
    const existing = await db.select().from(roles).where(eq(roles.name, r.name)).limit(1);

    if (existing.length > 0) {
      roleId = existing[0].id;
    } else {
      const [inserted] = await db
        .insert(roles)
        .values({
          name: r.name,
          description: r.description,
          isDefault: r.isDefault,
        })
        .returning();
      roleId = inserted.id;
    }
    roleMap[r.name] = roleId;

    // Attach role permissions
    for (const permName of r.perms) {
      const permId = permissionMap[permName];
      if (permId) {
        const existingRP = await db
          .select()
          .from(rolePermissions)
          .where(eq(rolePermissions.roleId, roleId));
        const hasPerm = existingRP.some((rp) => rp.permissionId === permId);

        if (!hasPerm) {
          await db.insert(rolePermissions).values({
            roleId,
            permissionId: permId,
          });
        }
      }
    }
  }

  // 3. Map existing users in users table to userRoles
  const allUsers = await db.select().from(users);
  for (const u of allUsers) {
    const targetRoleId = roleMap[u.role] || roleMap["STUDENT"];
    if (targetRoleId) {
      const existingUR = await db
        .select()
        .from(userRoles)
        .where(eq(userRoles.userId, u.id));

      if (existingUR.length === 0) {
        await db.insert(userRoles).values({
          userId: u.id,
          roleId: targetRoleId,
        });
      }
    }
  }

  console.log("RBAC seeding complete!");
}

if (require.main === module) {
  seedRbac().then(() => process.exit(0)).catch((err) => {
    console.error("RBAC seed error:", err);
    process.exit(1);
  });
}

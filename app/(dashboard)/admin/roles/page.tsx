"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Lock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  permissionIds: string[];
  permissions: Permission[];
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  roleEnum: string;
  department: string | null;
  roleId: string | null;
  roleName: string | null;
}

export default function RolesManagementPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");

  const [rolesList, setRolesList] = useState<RoleItem[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissionIds: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, usersRes] = await Promise.all([
        fetch("/api/roles"),
        fetch("/api/users"),
      ]);

      const rolesData = await rolesRes.json();
      const usersData = await usersRes.json();

      if (rolesRes.ok) {
        setRolesList(rolesData.roles || []);
        setAllPermissions(rolesData.allPermissions || []);
      }

      if (usersRes.ok) {
        setUsersList(usersData || []);
      }
    } catch {
      setToastMsg({ type: "error", text: "Failed to load RBAC data." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({ name: "", description: "", permissionIds: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: RoleItem) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissionIds: role.permissionIds || [],
    });
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    setFormData((prev) => {
      const exists = prev.permissionIds.includes(permId);
      return {
        ...prev,
        permissionIds: exists
          ? prev.permissionIds.filter((id) => id !== permId)
          : [...prev.permissionIds, permId],
      };
    });
  };

  const handleSubmitRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (formData.permissionIds.length === 0) {
      setToastMsg({ type: "error", text: "Please select at least one permission." });
      return;
    }

    setIsSubmitting(true);
    setToastMsg(null);

    try {
      const isEdit = !!editingRole;
      const url = isEdit ? `/api/roles/${editingRole.id}` : "/api/roles";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();

      if (!res.ok) {
        setToastMsg({ type: "error", text: resData.error || "Failed to save role." });
      } else {
        setToastMsg({
          type: "success",
          text: isEdit ? "Role updated successfully!" : "Role created successfully!",
        });
        setIsModalOpen(false);
        fetchData();
      }
    } catch {
      setToastMsg({ type: "error", text: "An error occurred while saving role." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: RoleItem) => {
    if (role.isDefault) {
      setToastMsg({ type: "error", text: "Default system roles cannot be deleted." });
      return;
    }

    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
      const resData = await res.json();

      if (!res.ok) {
        setToastMsg({ type: "error", text: resData.error || "Failed to delete role." });
      } else {
        setToastMsg({ type: "success", text: "Role deleted successfully." });
        fetchData();
      }
    } catch {
      setToastMsg({ type: "error", text: "An error occurred while deleting role." });
    }
  };

  const handleAssignUserRole = async (userId: string, newRoleId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: newRoleId }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setToastMsg({ type: "error", text: resData.error || "Failed to assign user role." });
      } else {
        setToastMsg({ type: "success", text: "User role updated successfully." });
        fetchData();
      }
    } catch {
      setToastMsg({ type: "error", text: "An error occurred while updating user role." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" />
            Configurable RBAC Management
          </h1>
          <p className="text-sm text-gray-500">
            Define system roles, assign permissions, and manage user role mappings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" /> Create Custom Role
          </button>
        </div>
      </div>

      {toastMsg && (
        <div
          className={`flex items-center justify-between rounded-md p-3 text-sm font-medium ${
            toastMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span className="flex items-center gap-2">
            {toastMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            {toastMsg.text}
          </span>
          <button
            onClick={() => setToastMsg(null)}
            className="text-xs font-semibold underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "roles"
                ? "border-purple-600 text-purple-600 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Shield className="h-4 w-4" /> Roles & Permissions ({rolesList.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "users"
                ? "border-purple-600 text-purple-600 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserCheck className="h-4 w-4" /> User Role Assignment ({usersList.length})
          </button>
        </nav>
      </div>

      {/* Roles Tab Content */}
      {activeTab === "roles" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Role Name</th>
                    <th className="px-6 py-3 font-semibold">Description</th>
                    <th className="px-6 py-3 font-semibold">Assigned Permissions</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rolesList.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                        {role.name}
                        {role.isDefault && (
                          <span
                            title="Default system role — cannot be deleted"
                            className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800"
                          >
                            <Lock className="h-3 w-3" /> System Default
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 max-w-xs">
                        {role.description || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {role.permissions.map((p) => (
                            <Badge key={p.id} variant="purple">
                              {p.name}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(role)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </button>
                          {!role.isDefault && (
                            <button
                              onClick={() => handleDeleteRole(role)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* User Role Assignment Tab Content */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">User</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">Department</th>
                    <th className="px-6 py-3 font-semibold">Current Assigned Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usersList.map((user) => {
                    const currentRoleId =
                      user.roleId || rolesList.find((r) => r.name === user.roleEnum)?.id || "";

                    return (
                      <tr key={user.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {user.department || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={currentRoleId}
                            onChange={(e) => handleAssignUserRole(user.id, e.target.value)}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none"
                          >
                            <option value="" disabled>
                              Select Role
                            </option>
                            {rolesList.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} {r.isDefault ? "(Default)" : ""}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Role Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl border border-gray-200 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editingRole ? `Edit Role: ${editingRole.name}` : "Create Custom Role"}
            </h2>

            <form onSubmit={handleSubmitRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LAB_ASSISTANT"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief role description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                  Permissions (Check all that apply)
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border border-gray-200 p-3 bg-gray-50">
                  {allPermissions.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer hover:text-gray-900"
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissionIds.includes(perm.id)}
                        onChange={() => handleTogglePermission(perm.id)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <span className="font-semibold text-gray-900">{perm.name}</span>
                        {perm.description && (
                          <span className="text-gray-500 block text-[11px]">
                            {perm.description}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

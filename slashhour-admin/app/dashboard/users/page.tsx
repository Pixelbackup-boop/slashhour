"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import type { User, PaginatedResponse } from "@/lib/types";
import { Search, UserCheck, UserX, Trash2, Mail, Eye, Download, Filter } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ["users", page, search, statusFilter, userTypeFilter, emailVerifiedFilter],
    queryFn: () =>
      usersAPI.getUsers({
        page,
        limit: 20,
        search,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(userTypeFilter !== "all" && { user_type: userTypeFilter }),
        ...(emailVerifiedFilter !== "all" && { email_verified: emailVerifiedFilter === "verified" }),
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      usersAPI.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (id: string) => usersAPI.verifyEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedUsers(new Set());
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleStatusChange = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    if (confirm(`Are you sure you want to ${newStatus} this user?`)) {
      updateStatusMutation.mutate({ id, status: newStatus });
    }
  };

  const handleVerifyEmail = (id: string) => {
    if (confirm("Manually verify this user's email?")) {
      verifyEmailMutation.mutate(id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(id);
    }
  };

  const toggleUserSelection = (id: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === data?.data.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(data?.data.map((u) => u.id) || []));
    }
  };

  const handleBulkAction = async (action: "activate" | "suspend" | "delete") => {
    if (selectedUsers.size === 0) {
      alert("No users selected");
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedUsers.size} user(s)?`;
    if (!confirm(confirmMessage)) return;

    const promises = Array.from(selectedUsers).map((id) => {
      if (action === "delete") {
        return deleteUserMutation.mutateAsync(id);
      } else {
        return updateStatusMutation.mutateAsync({ id, status: action === "activate" ? "active" : "suspended" });
      }
    });

    try {
      await Promise.all(promises);
      setSelectedUsers(new Set());
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error) {
      console.error("Bulk action failed:", error);
      alert("Some operations failed. Please try again.");
    }
  };

  const handleExport = () => {
    if (!data?.data) return;

    const headers = ["Name", "Username", "Email", "Type", "Status", "Email Verified", "Joined"];
    const rows = data.data.map((user) => [
      user.name || "",
      user.username,
      user.email,
      user.user_type,
      user.status,
      user.email_verified ? "Yes" : "No",
      new Date(user.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage user accounts, verify emails, and moderate user activity
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by email, username, or name..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-4 rounded-lg bg-gray-50 p-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                User Type
              </label>
              <select
                value={userTypeFilter}
                onChange={(e) => {
                  setUserTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="consumer">Consumer</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email Status
              </label>
              <select
                value={emailVerifiedFilter}
                onChange={(e) => {
                  setEmailVerifiedFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="mb-4 flex items-center gap-4 rounded-lg bg-blue-50 p-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedUsers.size} user(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("activate")}
              className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction("suspend")}
              className="rounded bg-orange-600 px-3 py-1 text-sm text-white hover:bg-orange-700"
            >
              Suspend
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedUsers(new Set())}
              className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {data?.meta && (
        <div className="mb-6 text-sm text-gray-600">
          Showing {data.data.length} of {data.meta.total} users
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading users...</div>
          </div>
        ) : !data?.data?.length ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">No users found</div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === data.data.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.data.map((user: User) => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 ${
                    selectedUsers.has(user.id) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name || user.username}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          user.user_type === "business"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.user_type === "business" && (
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {user.user_type === "business"
                          ? "Business Owner"
                          : "Consumer"}
                      </span>
                      {user._count?.businesses > 0 && user.user_type === "business" && (
                        <span className="text-xs text-gray-500">
                          (has shop)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                      {!user.email_verified && (
                        <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                          Email unverified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-col gap-1">
                      <span>{user._count?.businesses || 0} businesses</span>
                      <span>{user._count?.user_redemptions || 0} redemptions</span>
                      <span>{user._count?.follows || 0} follows</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDateTime(user.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {!user.email_verified && (
                        <button
                          onClick={() => handleVerifyEmail(user.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Verify email"
                        >
                          <Mail className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange(user.id, user.status)}
                        className={
                          user.status === "active"
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }
                        title={user.status === "active" ? "Suspend" : "Activate"}
                      >
                        {user.status === "active" ? (
                          <UserX className="h-5 w-5" />
                        ) : (
                          <UserCheck className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/users/${user.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete user"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {data.meta.page} of {data.meta.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= data.meta.totalPages}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

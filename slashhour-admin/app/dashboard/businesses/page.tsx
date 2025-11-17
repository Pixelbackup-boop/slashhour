"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { businessesAPI } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types";

interface Business {
  id: string;
  business_name: string;
  slug: string;
  category: string;
  owner_id: string;
  is_verified: boolean;
  subscription_tier: string;
  subscription_status: string;
  city: string;
  state_province: string;
  country: string;
  created_at: string;
  owner?: {
    username: string;
    email: string;
  };
}

export default function BusinessesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<PaginatedResponse<Business>>({
    queryKey: ["businesses", page, search, statusFilter],
    queryFn: () =>
      businessesAPI.getBusinesses({
        page,
        limit: 20,
        search,
        ...(statusFilter !== "all" && { status: statusFilter }),
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => businessesAPI.verifyBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });

  const unverifyMutation = useMutation({
    mutationFn: (id: string) => businessesAPI.unverifyBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => businessesAPI.deleteBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });

  const handleVerify = (id: string, isVerified: boolean) => {
    if (
      window.confirm(
        `Are you sure you want to ${isVerified ? "unverify" : "verify"} this business?`
      )
    ) {
      if (isVerified) {
        unverifyMutation.mutate(id);
      } else {
        verifyMutation.mutate(id);
      }
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600">
        Error loading businesses: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and moderate business accounts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by business name, slug, or owner..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-48"
          >
            <option value="all">All Businesses</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
            <option value="premium">Premium Tier</option>
            <option value="standard">Standard Tier</option>
          </select>
        </div>
      </div>

      {/* Business List */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading businesses...</div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No businesses found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Subscription
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
                {data.data.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {business.business_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          /{business.slug}
                        </span>
                        <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">
                          {business.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {business.owner?.username || "Unknown"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {business.owner?.email || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {business.city}, {business.state_province}
                      </div>
                      <div className="text-sm text-gray-500">{business.country}</div>
                    </td>
                    <td className="px-6 py-4">
                      {business.is_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium capitalize text-gray-900">
                          {business.subscription_tier}
                        </span>
                        <span
                          className={`text-xs ${
                            business.subscription_status === "active"
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {business.subscription_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(business.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleVerify(business.id, business.is_verified)
                          }
                          className={`rounded px-3 py-1 text-xs font-medium ${
                            business.is_verified
                              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {business.is_verified ? "Unverify" : "Verify"}
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(business.id, business.business_name)
                          }
                          className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * (data.pagination.limit || 20) + 1} to{" "}
              {Math.min(page * (data.pagination.limit || 20), data.pagination.total)}{" "}
              of {data.pagination.total} businesses
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (data.pagination.totalPages || 1)}
                className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

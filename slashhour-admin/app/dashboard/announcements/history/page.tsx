"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { messagesAPI } from "@/lib/api-client";
import Link from "next/link";

// Types
interface Broadcast {
  id: string;
  message: string;
  target_group: string;
  users_targeted: number;
  messages_sent: number;
  messages_delivered: number;
  messages_read: number;
  conversations_created: number;
  contains_links: boolean;
  total_link_clicks: number;
  status: string;
  sent_at: string;
  created_at: string;
  admins: {
    name: string;
    email: string;
  };
}

interface BroadcastsResponse {
  broadcasts: Broadcast[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function BroadcastHistoryPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Fetch broadcasts
  const { data, isLoading, error } = useQuery<BroadcastsResponse>({
    queryKey: ["broadcasts", page, statusFilter],
    queryFn: () =>
      messagesAPI.getBroadcasts({
        page,
        limit: 20,
        status: statusFilter || undefined,
      }),
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReadRate = (broadcast: Broadcast) => {
    if (broadcast.messages_sent === 0) return 0;
    return Math.round(
      (broadcast.messages_read / broadcast.messages_sent) * 100
    );
  };

  const getTargetGroupLabel = (group: string) => {
    const labels: Record<string, string> = {
      all: "All Users",
      new_users: "New Users",
      active_users: "Active Users",
      business_owners: "Business Owners",
      consumers: "Consumers",
    };
    return labels[group] || group;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📜 Broadcast History
          </h1>
          <p className="text-gray-600">
            View all sent announcements with detailed analytics
          </p>
        </div>
        <Link
          href="/dashboard/announcements"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ New Broadcast
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">
            Filter by status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="failed">Failed</option>
          </select>
          {data && (
            <span className="text-sm text-gray-600">
              {data.pagination.total} broadcast{data.pagination.total !== 1 ? "s" : ""} total
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading broadcasts...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          ❌ Error loading broadcasts: {(error as Error).message}
        </div>
      )}

      {/* Broadcasts Table */}
      {data && data.broadcasts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Read Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Links
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.broadcasts.map((broadcast) => (
                <tr
                  key={broadcast.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="max-w-md">
                      <p className="text-sm text-gray-900 truncate">
                        {broadcast.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        By {broadcast.admins.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getTargetGroupLabel(broadcast.target_group)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {broadcast.users_targeted} users
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="flex flex-col gap-1">
                      <span>📤 {broadcast.messages_sent}</span>
                      <span className="text-xs text-gray-500">
                        👁️ {broadcast.messages_read} read
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${getReadRate(broadcast)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {getReadRate(broadcast)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {broadcast.contains_links ? (
                      <div className="text-blue-600">
                        🔗 {broadcast.total_link_clicks} clicks
                      </div>
                    ) : (
                      <span className="text-gray-400">No links</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {formatDate(broadcast.sent_at || broadcast.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/dashboard/announcements/analytics/${broadcast.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Analytics →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {data && data.broadcasts.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No broadcasts yet
          </h3>
          <p className="text-gray-600 mb-4">
            Send your first announcement to get started
          </p>
          <Link
            href="/dashboard/announcements"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send Broadcast
          </Link>
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} of {data.pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(data.pagination.totalPages, p + 1))
            }
            disabled={page === data.pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

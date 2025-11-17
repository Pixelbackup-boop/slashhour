"use client";

import { useQuery } from "@tanstack/react-query";
import { messagesAPI } from "@/lib/api-client";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function BroadcastAnalyticsPage() {
  const params = useParams();
  const broadcastId = params.id as string;

  // Fetch broadcast details
  const { data: broadcast, isLoading, error } = useQuery({
    queryKey: ["broadcast", broadcastId],
    queryFn: () => messagesAPI.getBroadcast(broadcastId),
    enabled: !!broadcastId,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTargetGroupLabel = (group: string) => {
    const labels: Record<string, string> = {
      all: "All Users",
      new_users: "New Users (Last 7 Days)",
      active_users: "Active Users (Last 30 Days)",
      business_owners: "Business Owners",
      consumers: "Consumers",
    };
    return labels[group] || group;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !broadcast) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
          <h2 className="text-lg font-semibold mb-2">❌ Error</h2>
          <p>{error ? (error as Error).message : "Broadcast not found"}</p>
          <Link
            href="/dashboard/announcements/history"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            ← Back to History
          </Link>
        </div>
      </div>
    );
  }

  const readRate = broadcast.analytics?.read_rate || 0;
  const deliveryRate =
    broadcast.messages_sent > 0
      ? Math.round((broadcast.messages_delivered / broadcast.messages_sent) * 100)
      : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/announcements/history"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-2"
        >
          ← Back to History
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Broadcast Analytics
        </h1>
        <p className="text-gray-600">
          Detailed performance metrics for this announcement
        </p>
      </div>

      {/* Message Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">📝 Message</h2>
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-gray-800 whitespace-pre-wrap">{broadcast.message}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Sent by:</span>
            <p className="font-medium">{broadcast.admins?.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Target Group:</span>
            <p className="font-medium">{getTargetGroupLabel(broadcast.target_group)}</p>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <p className="font-medium capitalize">{broadcast.status}</p>
          </div>
          <div>
            <span className="text-gray-500">Sent at:</span>
            <p className="font-medium">
              {formatDate(broadcast.sent_at || broadcast.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon="🎯"
          label="Users Targeted"
          value={broadcast.users_targeted}
          color="blue"
        />
        <MetricCard
          icon="📤"
          label="Messages Sent"
          value={broadcast.messages_sent}
          color="green"
        />
        <MetricCard
          icon="👁️"
          label="Messages Read"
          value={broadcast.analytics?.messages_read || broadcast.messages_read}
          color="purple"
        />
        <MetricCard
          icon="💬"
          label="New Conversations"
          value={broadcast.conversations_created}
          color="orange"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Delivery Funnel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">📊 Delivery Funnel</h2>
          <div className="space-y-4">
            <FunnelBar
              label="Sent"
              value={broadcast.messages_sent}
              total={broadcast.messages_sent}
              color="blue"
            />
            <FunnelBar
              label="Delivered"
              value={broadcast.messages_delivered}
              total={broadcast.messages_sent}
              color="green"
            />
            <FunnelBar
              label="Read"
              value={broadcast.analytics?.messages_read || 0}
              total={broadcast.messages_sent}
              color="purple"
            />
          </div>
        </div>

        {/* Read Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">📈 Performance Rates</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Delivery Rate
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {deliveryRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${deliveryRate}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Read Rate
                </span>
                <span className="text-2xl font-bold text-purple-600">
                  {readRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all"
                  style={{ width: `${readRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Link Analytics */}
      {broadcast.contains_links && broadcast.analytics?.link_stats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">🔗 Link Analytics</h2>
          <div className="space-y-4">
            {broadcast.analytics.link_stats.map((link: any, index: number) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium break-all"
                  >
                    {link.url} ↗
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total Clicks:</span>
                    <p className="font-semibold text-lg">{link.total_clicks}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Unique Users:</span>
                    <p className="font-semibold text-lg">{link.unique_users}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Click Rate:</span>
                    <p className="font-semibold text-lg">
                      {broadcast.messages_sent > 0
                        ? Math.round((link.total_clicks / broadcast.messages_sent) * 100)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              📊 <strong>Total Link Clicks:</strong>{" "}
              {broadcast.total_link_clicks || 0} across all links
            </p>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">ℹ️ Additional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Broadcast ID:</span>
            <p className="font-mono text-xs mt-1">{broadcast.id}</p>
          </div>
          <div>
            <span className="text-gray-500">Errors:</span>
            <p className="font-semibold mt-1">
              {broadcast.errors_count || 0} failed
            </p>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>
            <p className="font-medium mt-1">{formatDate(broadcast.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    green: "bg-green-50 border-green-200 text-green-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
    orange: "bg-orange-50 border-orange-200 text-orange-900",
  };

  return (
    <div
      className={`rounded-lg border p-6 ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
    </div>
  );
}

function FunnelBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{value.toLocaleString()}</span>
          <span className="text-xs text-gray-500">({percentage}%)</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

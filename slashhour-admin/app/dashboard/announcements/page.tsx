"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { messagesAPI } from "@/lib/api-client";
import Link from "next/link";

// Types
interface BroadcastStats {
  total_sent: number;
  total_delivered: number;
  total_read: number;
  failed: number;
}

interface UserCounts {
  all: number;
  new_users: number;
  active_users: number;
  business_owners: number;
  consumers: number;
}

type TargetGroup = keyof UserCounts;

export default function AnnouncementsPage() {
  // State
  const [message, setMessage] = useState("");
  const [targetGroup, setTargetGroup] = useState<TargetGroup>("all");
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch user counts
  const { data: userCounts, isLoading: countsLoading } = useQuery<UserCounts>({
    queryKey: ["user-counts"],
    queryFn: () => messagesAPI.getUserCounts(),
  });

  // Fetch broadcast stats
  const { data: stats, isLoading: statsLoading } = useQuery<BroadcastStats>({
    queryKey: ["broadcast-stats"],
    queryFn: () => messagesAPI.getBroadcastStats(),
  });

  // Broadcast mutation
  const broadcastMutation = useMutation({
    mutationFn: (data: { message: string; target_group: TargetGroup }) =>
      messagesAPI.broadcastMessage(data),
    onSuccess: (response) => {
      alert(
        `✅ Message sent successfully!\n\n` +
          `Sent to: ${response.stats.messages_sent} users\n` +
          `New conversations: ${response.stats.conversations_created}`
      );
      setMessage("");
      setShowConfirmDialog(false);
    },
    onError: (error: any) => {
      alert(
        `❌ Failed to send message\n\n` +
          `Error: ${error.response?.data?.message || error.message}`
      );
    },
  });

  const handleSend = () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    if (message.length > 1000) {
      alert("Message is too long (max 1000 characters)");
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSend = () => {
    broadcastMutation.mutate({
      message: message.trim(),
      target_group: targetGroup,
    });
  };

  const targetUserCount = userCounts?.[targetGroup] || 0;
  const charCount = message.length;
  const charLimit = 1000;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📢 Send Announcement
          </h1>
          <p className="text-gray-600">
            Broadcast messages to users via the Slashhour messaging system
          </p>
        </div>

        {/* Dropdown Menu */}
        <div className="relative dropdown-container">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 bg-white"
          >
            <span>Announcements</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                showDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <Link
                href="/dashboard/announcements/history"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                onClick={() => setShowDropdown(false)}
              >
                <span className="text-lg">📜</span>
                <div>
                  <div className="font-medium">View History</div>
                  <div className="text-xs text-gray-500">
                    Past broadcasts & analytics
                  </div>
                </div>
              </Link>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-left"
              >
                <span className="text-lg">✍️</span>
                <div>
                  <div className="font-medium">Compose New</div>
                  <div className="text-xs text-gray-500">
                    Send new announcement
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Composer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Compose Message</h2>

            {/* Target Group Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value as TargetGroup)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={broadcastMutation.isPending}
              >
                <option value="all">
                  All Users {userCounts && `(${userCounts.all})`}
                </option>
                <option value="new_users">
                  New Users - Last 7 Days{" "}
                  {userCounts && `(${userCounts.new_users})`}
                </option>
                <option value="active_users">
                  Active Users - Last 30 Days{" "}
                  {userCounts && `(${userCounts.active_users})`}
                </option>
                <option value="business_owners">
                  Business Owners{" "}
                  {userCounts && `(${userCounts.business_owners})`}
                </option>
                <option value="consumers">
                  Consumers {userCounts && `(${userCounts.consumers})`}
                </option>
              </select>
              {userCounts && (
                <p className="mt-2 text-sm text-gray-600">
                  This message will be sent to{" "}
                  <span className="font-semibold text-blue-600">
                    {targetUserCount} user{targetUserCount !== 1 ? "s" : ""}
                  </span>
                </p>
              )}
            </div>

            {/* Message Text Area */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your announcement here... (supports emojis! 🎉)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={8}
                disabled={broadcastMutation.isPending}
                maxLength={charLimit}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Messages appear in users' inbox as a conversation with
                  "Slashhour"
                </p>
                <p
                  className={`text-sm ${
                    charCount > charLimit * 0.9
                      ? "text-red-600 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {charCount}/{charLimit}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={!message.trim() || broadcastMutation.isPending}
              >
                {showPreview ? "Hide" : "Show"} Preview
              </button>
              <button
                onClick={handleSend}
                disabled={
                  !message.trim() ||
                  broadcastMutation.isPending ||
                  targetUserCount === 0
                }
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {broadcastMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  `📤 Send to ${targetUserCount} User${
                    targetUserCount !== 1 ? "s" : ""
                  }`
                )}
              </button>
            </div>
          </div>

          {/* Preview */}
          {showPreview && message.trim() && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">
                📱 Preview (How users will see it)
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Slashhour</p>
                    <p className="text-xs text-gray-500">System Message</p>
                  </div>
                </div>
                <div className="mt-3 bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-gray-800 whitespace-pre-wrap">{message}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Delivery Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">📊 Delivery Stats</h2>
            {statsLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : stats ? (
              <div className="space-y-3">
                <StatItem
                  label="Total Sent"
                  value={stats.total_sent}
                  icon="📤"
                />
                <StatItem
                  label="Delivered"
                  value={stats.total_delivered}
                  icon="✅"
                />
                <StatItem label="Read" value={stats.total_read} icon="👁️" />
                <StatItem label="Failed" value={stats.failed} icon="❌" />
                {stats.total_sent > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Read Rate:{" "}
                      <span className="font-semibold text-blue-600">
                        {Math.round((stats.total_read / stats.total_sent) * 100)}
                        %
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No stats available</p>
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2">
                <span>•</span>
                <span>Keep messages concise and actionable</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Use emojis to make messages more engaging</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Test with yourself first (send to consumers group)</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Messages appear in users' Messages tab</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Confirm Broadcast</h3>
            <p className="text-gray-600 mb-2">
              You are about to send this message to:
            </p>
            <p className="text-lg font-semibold text-blue-600 mb-4">
              {targetUserCount} {targetGroup.replace("_", " ")}
            </p>
            <div className="bg-gray-50 rounded p-3 mb-6 max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {message}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={broadcastMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmSend}
                disabled={broadcastMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {broadcastMutation.isPending ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Component
function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 flex items-center gap-2">
        <span>{icon}</span>
        {label}
      </span>
      <span className="font-semibold text-gray-900">{value.toLocaleString()}</span>
    </div>
  );
}

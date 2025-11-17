"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contentAPI } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types";

interface Report {
  id: string;
  reporter_id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution: string | null;
  created_at: string;
  reporter?: {
    username: string;
    email: string;
  };
}

interface Review {
  id: string;
  user_id: string;
  business_id: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
  user?: {
    username: string;
  };
  business?: {
    business_name: string;
  };
}

type ContentTab = "reports" | "reviews";

export default function ContentModerationPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>("reports");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: reportsData, isLoading: reportsLoading } = useQuery<
    PaginatedResponse<Report>
  >({
    queryKey: ["reports", page, statusFilter],
    queryFn: () =>
      contentAPI.getReports({
        page,
        limit: 20,
        ...(statusFilter !== "all" && { status: statusFilter }),
      }),
    enabled: activeTab === "reports",
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery<
    PaginatedResponse<Review>
  >({
    queryKey: ["reviews", page, statusFilter],
    queryFn: () =>
      contentAPI.getReviews({
        page,
        limit: 20,
        ...(statusFilter !== "all" && { status: statusFilter }),
      }),
    enabled: activeTab === "reviews",
  });

  const reviewReportMutation = useMutation({
    mutationFn: ({
      id,
      status,
      resolution,
    }: {
      id: string;
      status: string;
      resolution: string;
    }) => contentAPI.reviewReport(id, { status, resolution }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const updateReviewStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      contentAPI.updateReviewStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id: string) => contentAPI.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const handleReviewReport = (id: string, approve: boolean) => {
    const status = approve ? "resolved" : "rejected";
    const resolution = approve
      ? "Content reviewed and approved"
      : "Report rejected - no action needed";

    if (window.confirm(`${approve ? "Approve" : "Reject"} this report?`)) {
      reviewReportMutation.mutate({ id, status, resolution });
    }
  };

  const handleReviewStatus = (id: string, status: string) => {
    if (window.confirm(`Change review status to "${status}"?`)) {
      updateReviewStatusMutation.mutate({ id, status });
    }
  };

  const handleDeleteReview = (id: string) => {
    if (window.confirm("Delete this review permanently?")) {
      deleteReviewMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      approved: "bg-green-100 text-green-800",
      flagged: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Content Moderation
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review reported content and moderate user reviews
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => {
              setActiveTab("reports");
              setPage(1);
            }}
            className={`border-b-2 pb-4 text-sm font-medium ${
              activeTab === "reports"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Reported Content
          </button>
          <button
            onClick={() => {
              setActiveTab("reviews");
              setPage(1);
            }}
            className={`border-b-2 pb-4 text-sm font-medium ${
              activeTab === "reviews"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            User Reviews
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
        <div className="flex-1">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-48"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
            {activeTab === "reviews" && <option value="approved">Approved</option>}
            {activeTab === "reviews" && <option value="flagged">Flagged</option>}
          </select>
        </div>
      </div>

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          {reportsLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading reports...
            </div>
          ) : !reportsData?.data || reportsData.data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No reports found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reportsData.data.map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadge(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                          {report.content_type}
                        </span>
                        <span className="text-sm text-gray-500">
                          Reported by {report.reporter?.username || "Unknown"}
                        </span>
                      </div>
                      <h3 className="mt-3 font-medium text-gray-900">
                        Reason: {report.reason}
                      </h3>
                      {report.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {report.description}
                        </p>
                      )}
                      {report.resolution && (
                        <div className="mt-3 rounded-lg bg-gray-50 p-3">
                          <p className="text-sm font-medium text-gray-700">
                            Resolution:
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            {report.resolution}
                          </p>
                        </div>
                      )}
                      <div className="mt-3 text-xs text-gray-500">
                        Reported on{" "}
                        {new Date(report.created_at).toLocaleString()}
                      </div>
                    </div>
                    {report.status === "pending" && (
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => handleReviewReport(report.id, true)}
                          className="rounded bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewReport(report.id, false)}
                          className="rounded bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {reportsData && reportsData.pagination && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
              <div className="text-sm text-gray-700">
                Showing {(page - 1) * (reportsData.pagination.limit || 20) + 1} to{" "}
                {Math.min(
                  page * (reportsData.pagination.limit || 20),
                  reportsData.pagination.total
                )}{" "}
                of {reportsData.pagination.total} reports
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
                  disabled={page >= (reportsData.pagination.totalPages || 1)}
                  className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          {reviewsLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading reviews...
            </div>
          ) : !reviewsData?.data || reviewsData.data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No reviews found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reviewsData.data.map((review) => (
                <div key={review.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadge(
                            review.status
                          )}`}
                        >
                          {review.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">
                          {review.user?.username || "Unknown User"}
                        </span>
                        <span>reviewed</span>
                        <span className="font-medium">
                          {review.business?.business_name || "Unknown Business"}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-900">{review.comment}</p>
                      <div className="mt-3 text-xs text-gray-500">
                        Posted on {new Date(review.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      {review.status !== "approved" && (
                        <button
                          onClick={() => handleReviewStatus(review.id, "approved")}
                          className="rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                        >
                          Approve
                        </button>
                      )}
                      {review.status !== "flagged" && (
                        <button
                          onClick={() => handleReviewStatus(review.id, "flagged")}
                          className="rounded bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-200"
                        >
                          Flag
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {reviewsData && reviewsData.pagination && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
              <div className="text-sm text-gray-700">
                Showing {(page - 1) * (reviewsData.pagination.limit || 20) + 1} to{" "}
                {Math.min(
                  page * (reviewsData.pagination.limit || 20),
                  reviewsData.pagination.total
                )}{" "}
                of {reviewsData.pagination.total} reviews
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
                  disabled={page >= (reviewsData.pagination.totalPages || 1)}
                  className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

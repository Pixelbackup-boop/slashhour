"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { usersAPI } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Activity,
  Building2,
  ShoppingBag,
  Heart,
  Star,
  Bookmark,
  MapPin,
} from "lucide-react";

// Extended User type for detail page
interface UserDetail {
  id: string;
  email: string | null;
  username: string;
  name: string | null;
  user_type: "consumer" | "business";
  status: "active" | "suspended";
  email_verified: boolean;
  phone_verified: boolean;
  phone: string | null;
  created_at: string;
  last_active_at: string;
  businesses?: Array<{
    id: string;
    business_name: string;
    slug: string;
    category: string;
    is_verified: boolean;
    subscription_tier: string;
    created_at: string;
  }>;
  _count?: {
    user_redemptions: number;
    follows: number;
    business_reviews: number;
    bookmarks: number;
  };
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: user, isLoading, error } = useQuery<UserDetail>({
    queryKey: ["user", userId],
    queryFn: () => usersAPI.getUser(userId),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-xl font-semibold text-red-900">User Not Found</h2>
        <p className="mt-2 text-red-700">
          The user you're looking for doesn't exist or has been deleted.
        </p>
        <button
          onClick={() => router.push("/dashboard/users")}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Users
          </button>
          <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - User Info Card */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {/* User Avatar & Name */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white">
                {(user.name || user.username).charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.name || user.username}
              </h2>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>

            {/* User Type Badge */}
            <div className="mb-6 flex justify-center">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  user.user_type === "business"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {user.user_type === "business" && (
                  <Building2 className="h-4 w-4" />
                )}
                {user.user_type === "business" ? "Business Owner" : "Consumer"}
              </span>
            </div>

            {/* Status Badge */}
            <div className="mb-6 flex justify-center">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  user.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {user.status === "active" ? "Active" : "Suspended"}
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user.email || "Not provided"}</p>
                  {user.email && (
                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        user.email_verified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.email_verified ? "Verified" : "Unverified"}
                    </span>
                  )}
                </div>
              </div>

              {user.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{user.phone}</p>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        user.phone_verified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.phone_verified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="mt-1 h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(user.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Activity className="mt-1 h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Last Active</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(user.last_active_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Activity & Business Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Activity Stats */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Activity Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <Building2 className="h-5 w-5" />
                  <p className="text-sm font-medium">Businesses</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {user.businesses?.length || 0}
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-600">
                  <ShoppingBag className="h-5 w-5" />
                  <p className="text-sm font-medium">Redemptions</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {user._count?.user_redemptions || 0}
                </p>
              </div>

              <div className="rounded-lg bg-purple-50 p-4">
                <div className="flex items-center gap-2 text-purple-600">
                  <Heart className="h-5 w-5" />
                  <p className="text-sm font-medium">Follows</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {user._count?.follows || 0}
                </p>
              </div>

              <div className="rounded-lg bg-yellow-50 p-4">
                <div className="flex items-center gap-2 text-yellow-600">
                  <Star className="h-5 w-5" />
                  <p className="text-sm font-medium">Reviews</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {user._count?.business_reviews || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Business Ownership (if business owner) */}
          {user.businesses && user.businesses.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Business Ownership
              </h3>
              <div className="space-y-4">
                {user.businesses.map((business) => (
                  <div
                    key={business.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {business.business_name}
                          </h4>
                          {business.is_verified && (
                            <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          @{business.slug}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {business.category}
                          </span>
                          <span className="capitalize">
                            {business.subscription_tier} plan
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-gray-400">
                          Created: {formatDateTime(business.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Metrics */}
          {user._count && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Additional Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Bookmark className="h-5 w-5" />
                    <span>Bookmarked Deals</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {user._count.bookmarks || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

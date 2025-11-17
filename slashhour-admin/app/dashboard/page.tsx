"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "@/lib/api-client";
import { formatNumber } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types";
import { Users, Building2, Tag, ShoppingCart, TrendingUp, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
}: StatCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <p className="mt-1 flex items-center text-sm text-green-600">
              <TrendingUp className="mr-1 h-4 w-4" />
              {trend}
            </p>
          )}
        </div>
        <div className="rounded-full bg-blue-100 p-3">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => analyticsAPI.getDashboard(),
  });

  const { data: userGrowthData } = useQuery({
    queryKey: ["user-growth"],
    queryFn: () => analyticsAPI.getUserGrowth({ period: "30d" }),
  });

  const { data: dealPerformanceData } = useQuery({
    queryKey: ["deal-performance"],
    queryFn: () => analyticsAPI.getDealsPerformance({ period: "30d" }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Error loading dashboard. Please try again.
      </div>
    );
  }

  const { overview, recentGrowth } = stats || {};

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to the Slashhour admin panel. Here's your platform overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={overview?.totalUsers || 0}
          icon={Users}
          subtitle={`${overview?.activeUsers || 0} active (30 days)`}
          trend={recentGrowth?.newUsers ? `+${recentGrowth.newUsers} this week` : undefined}
        />
        <StatCard
          title="Total Businesses"
          value={overview?.totalBusinesses || 0}
          icon={Building2}
          subtitle={`${overview?.verifiedBusinesses || 0} verified`}
          trend={recentGrowth?.newBusinesses ? `+${recentGrowth.newBusinesses} this week` : undefined}
        />
        <StatCard
          title="Total Deals"
          value={overview?.totalDeals || 0}
          icon={Tag}
          subtitle={`${overview?.activeDeals || 0} active`}
          trend={recentGrowth?.newDeals ? `+${recentGrowth.newDeals} this week` : undefined}
        />
        <StatCard
          title="Total Redemptions"
          value={overview?.totalRedemptions || 0}
          icon={ShoppingCart}
          trend={recentGrowth?.newRedemptions ? `+${recentGrowth.newRedemptions} this week` : undefined}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/dashboard/users"
            className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <Users className="h-8 w-8 text-blue-600" />
            <h3 className="mt-2 font-medium text-gray-900">Manage Users</h3>
            <p className="mt-1 text-sm text-gray-500">
              View, edit, and manage user accounts
            </p>
          </a>
          <a
            href="/dashboard/businesses"
            className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <Building2 className="h-8 w-8 text-green-600" />
            <h3 className="mt-2 font-medium text-gray-900">Verify Businesses</h3>
            <p className="mt-1 text-sm text-gray-500">
              Review and verify business accounts
            </p>
          </a>
          <a
            href="/dashboard/deals"
            className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <Tag className="h-8 w-8 text-purple-600" />
            <h3 className="mt-2 font-medium text-gray-900">Moderate Deals</h3>
            <p className="mt-1 text-sm text-gray-500">
              Review and manage active deals
            </p>
          </a>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            User Growth (Last 30 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={
                userGrowthData?.data || [
                  { date: "Week 1", users: 120 },
                  { date: "Week 2", users: 145 },
                  { date: "Week 3", users: 180 },
                  { date: "Week 4", users: 220 },
                ]
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Total Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Deal Performance Chart */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Deal Redemptions (Last 30 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={
                dealPerformanceData?.data || [
                  { date: "Week 1", redemptions: 45 },
                  { date: "Week 2", redemptions: 62 },
                  { date: "Week 3", redemptions: 78 },
                  { date: "Week 4", redemptions: 95 },
                ]
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="redemptions"
                fill="#8b5cf6"
                name="Redemptions"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Business Categories */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Business Categories
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Food & Beverage", value: 35 },
                  { name: "Retail", value: 25 },
                  { name: "Services", value: 20 },
                  { name: "Entertainment", value: 15 },
                  { name: "Other", value: 5 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  "#3b82f6",
                  "#8b5cf6",
                  "#10b981",
                  "#f59e0b",
                  "#6b7280",
                ].map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Health */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Platform Health
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">User Engagement</span>
                <span className="font-medium text-gray-900">87%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: "87%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Business Verification Rate</span>
                <span className="font-medium text-gray-900">72%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: "72%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Deal Success Rate</span>
                <span className="font-medium text-gray-900">94%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-purple-500"
                  style={{ width: "94%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Platform Uptime</span>
                <span className="font-medium text-gray-900">99.9%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: "99.9%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <div className="space-y-4">
            {[
              {
                action: "New business verified",
                detail: "Coffee House Downtown",
                time: "5 minutes ago",
                icon: Building2,
                color: "text-green-600",
              },
              {
                action: "Deal approved",
                detail: "50% off Pizza Night Special",
                time: "15 minutes ago",
                icon: Tag,
                color: "text-purple-600",
              },
              {
                action: "New user registered",
                detail: "john@example.com",
                time: "1 hour ago",
                icon: Users,
                color: "text-blue-600",
              },
              {
                action: "Deal redeemed",
                detail: "Burger Combo at Food Court",
                time: "2 hours ago",
                icon: ShoppingCart,
                color: "text-orange-600",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0"
              >
                <activity.icon className={`h-5 w-5 ${activity.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

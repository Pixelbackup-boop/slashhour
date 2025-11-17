"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Tag,
  BarChart3,
  Shield,
  MessageSquare,
  Megaphone,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface SubItem {
  name: string;
  href: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  superAdminOnly?: boolean;
  subItems?: SubItem[];
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Businesses", href: "/dashboard/businesses", icon: Building2 },
  { name: "Deals", href: "/dashboard/deals", icon: Tag },
  { name: "Content Moderation", href: "/dashboard/content", icon: MessageSquare },
  {
    name: "Announcements",
    href: "/dashboard/announcements",
    icon: Megaphone,
    superAdminOnly: true,
    subItems: [
      { name: "Compose", href: "/dashboard/announcements" },
      { name: "History", href: "/dashboard/announcements/history" },
    ]
  },
  { name: "Admin Settings", href: "/dashboard/settings", icon: Settings, superAdminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredNavigation = navigation.filter(
    (item) => !item.superAdminOnly || admin?.role === "super_admin"
  );

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold">Slashhour Admin</h1>
      </div>

      {/* Admin Info */}
      <div className="border-b border-gray-700 px-6 py-4">
        <p className="text-sm font-medium">{admin?.name}</p>
        <p className="text-xs text-gray-400">{admin?.role}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const isExpanded = expandedItems.includes(item.name);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.name}>
              {/* Main Navigation Item */}
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )}

              {/* Sub Items (Dropdown) */}
              {hasSubItems && isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                          isSubActive
                            ? "bg-gray-800 text-white font-medium"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

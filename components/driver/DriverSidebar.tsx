"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useDriverStore } from "@/stores/driver-store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard, Truck, Package, Clock, CheckCircle, XCircle,
  MapPin, History, DollarSign, Star, Bell, User, Shield,
  LogOut, X, ChevronDown, TrendingUp, Navigation, Map,
  Receipt, HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number | string;
  children?: NavItem[];
}

const NAV_SECTIONS: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/driver/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    ],
  },
  {
    section: "Deliveries",
    items: [
      {
        label: "Orders",
        icon: <Truck className="w-4 h-4" />,
        children: [
          { label: "New Requests", href: "/driver/requests", icon: <Bell className="w-4 h-4" /> },
          { label: "Active Deliveries", href: "/driver/deliveries", icon: <Truck className="w-4 h-4" /> },
          { label: "Accepted", href: "/driver/deliveries?status=PROCESSING", icon: <CheckCircle className="w-4 h-4" /> },
          { label: "In Transit", href: "/driver/deliveries?status=SHIPPED", icon: <Navigation className="w-4 h-4" /> },
          { label: "Delivery History", href: "/driver/history", icon: <History className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    section: "Tracking",
    items: [
      { label: "Live Map", href: "/driver/map", icon: <Map className="w-4 h-4" /> },
      { label: "My Location", href: "/driver/location", icon: <MapPin className="w-4 h-4" /> },
    ],
  },
  {
    section: "Earnings",
    items: [
      {
        label: "Finance",
        icon: <DollarSign className="w-4 h-4" />,
        children: [
          { label: "Earnings Overview", href: "/driver/earnings", icon: <TrendingUp className="w-4 h-4" /> },
          { label: "Transaction History", href: "/driver/earnings/history", icon: <Receipt className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Reviews & Ratings", href: "/driver/ratings", icon: <Star className="w-4 h-4" /> },
      { label: "Notifications", href: "/driver/notifications", icon: <Bell className="w-4 h-4" /> },
      { label: "Profile", href: "/driver/profile", icon: <User className="w-4 h-4" /> },
      { label: "KYC Status", href: "/auth/kyc", icon: <Shield className="w-4 h-4" /> },
      { label: "Support", href: "/driver/support", icon: <HelpCircle className="w-4 h-4" /> },
    ],
  },
];

function SideNavItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(() =>
    item.children?.some((c) => c.href && pathname.startsWith(c.href.split("?")[0])) ?? false
  );
  const isActive = item.href
    ? pathname === item.href || pathname.startsWith(item.href.split("?")[0] + "/")
    : false;

  if (item.children) {
    const anyChildActive = item.children.some(
      (c) => c.href && pathname.startsWith(c.href.split("?")[0])
    );
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            anyChildActive
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          <span className={cn("flex-shrink-0", anyChildActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400")}>
            {item.icon}
          </span>
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge !== undefined && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">{item.badge}</span>
          )}
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform flex-shrink-0", expanded && "rotate-180")} />
        </button>
        {expanded && (
          <div className="ml-3 mt-0.5 pl-3 border-l border-gray-200 dark:border-gray-700 space-y-0.5">
            {item.children.map((child) => <SideNavItem key={child.label} item={child} />)}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
      )}
    >
      <span className={cn("flex-shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400")}>
        {item.icon}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">{item.badge}</span>
      )}
    </Link>
  );
}

interface DriverSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DriverSidebar({ open, onClose }: DriverSidebarProps) {
  const { user, logout } = useAuthStore();
  const { profile, toggleOnline } = useDriverStore();
  const router = useRouter();

  const driverName = user
    ? `${(user as any).first_name ?? ""} ${(user as any).last_name ?? ""}`.trim() ||
      user.email?.split("@")[0]
    : "Driver";

  const isOnline = profile?.status === "AVAILABLE";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully.");
      router.replace("/");
    } catch {
      toast.error("Failed to log out.");
    }
  };

  const handleToggle = async () => {
    await toggleOnline();
    toast.success(isOnline ? "You are now Offline" : "You are now Online");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <Link href="/driver/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Driver Hub</p>
            <p className="text-[10px] text-gray-400">Delivery Dashboard</p>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Driver profile + online toggle */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {profile?.profile_photo ? (
              <img src={profile.profile_photo} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {driverName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900",
              isOnline ? "bg-green-500" : "bg-gray-400"
            )} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{driverName}</p>
            <p className="text-[11px] text-gray-400">{profile?.vehicle_type ?? "Driver"}</p>
          </div>
          <button
            onClick={handleToggle}
            title={isOnline ? "Go Offline" : "Go Online"}
            className={cn(
              "w-10 h-5 rounded-full transition-colors flex-shrink-0 relative",
              isOnline ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
              isOnline ? "translate-x-5" : "translate-x-0.5"
            )} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.section}>
            <p className="px-3 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {section.section}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => <SideNavItem key={item.label} item={item} />)}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col h-full">{sidebarContent}</aside>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />
          <aside className="fixed left-0 top-0 z-50 flex w-60 flex-col h-full lg:hidden shadow-2xl">{sidebarContent}</aside>
        </>
      )}
    </>
  );
}

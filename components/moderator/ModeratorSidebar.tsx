"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useModeratorStore } from "@/stores/moderator-store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useIsMounted } from "@/hooks/use-is-mounted";
import {
  LayoutDashboard, ShieldCheck, Package, Users, Truck,
  MessageSquare, Bell, LogOut, ChevronDown, X, User,
  ShoppingBag, Star, MapPin, BarChart2, AlertTriangle,
  CheckCircle, Clock, FileText, HelpCircle, Settings,
} from "lucide-react";
import { toast } from "sonner";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number | string;
  children?: NavItem[];
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/moderator/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Analytics", href: "/moderator/analytics", icon: <BarChart2 className="w-4 h-4" /> },
    ],
  },
  {
    section: "Vendors",
    items: [
      {
        label: "Vendors",
        icon: <Users className="w-4 h-4" />,
        children: [
          { label: "All Vendors", href: "/moderator/vendors", icon: <Users className="w-4 h-4" /> },
          { label: "KYC Review", href: "/moderator/vendors/kyc", icon: <ShieldCheck className="w-4 h-4" /> },
          { label: "Suspended", href: "/moderator/vendors?is_active=false", icon: <AlertTriangle className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    section: "Drivers",
    items: [
      {
        label: "Drivers",
        icon: <Truck className="w-4 h-4" />,
        children: [
          { label: "All Drivers", href: "/moderator/drivers", icon: <Truck className="w-4 h-4" /> },
          { label: "KYC Review", href: "/moderator/drivers/kyc", icon: <ShieldCheck className="w-4 h-4" /> },
          { label: "Active Drivers", href: "/moderator/drivers?is_verified=true", icon: <CheckCircle className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    section: "Operations",
    items: [
      {
        label: "Products",
        icon: <Package className="w-4 h-4" />,
        children: [
          { label: "Moderation Queue", href: "/moderator/products", icon: <Clock className="w-4 h-4" /> },
          { label: "KYC Queue", href: "/moderator/kyc-review", icon: <ShieldCheck className="w-4 h-4" /> },
        ],
      },
      {
        label: "Orders",
        icon: <ShoppingBag className="w-4 h-4" />,
        children: [
          { label: "All Orders", href: "/moderator/orders", icon: <ShoppingBag className="w-4 h-4" /> },
          { label: "Pending", href: "/moderator/orders?status=PENDING", icon: <Clock className="w-4 h-4" /> },
          { label: "In Transit", href: "/moderator/orders?status=SHIPPED", icon: <Truck className="w-4 h-4" /> },
          { label: "Delivered", href: "/moderator/orders?status=DELIVERED", icon: <CheckCircle className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    section: "Complaints",
    items: [
      {
        label: "Complaints",
        icon: <MessageSquare className="w-4 h-4" />,
        children: [
          { label: "All Complaints", href: "/moderator/complaints", icon: <MessageSquare className="w-4 h-4" /> },
          { label: "New", href: "/moderator/complaints?status=NEW", icon: <AlertTriangle className="w-4 h-4" /> },
          { label: "Under Review", href: "/moderator/complaints?status=UNDER_REVIEW", icon: <Clock className="w-4 h-4" /> },
          { label: "Escalated", href: "/moderator/complaints?status=ESCALATED", icon: <Star className="w-4 h-4" /> },
          { label: "Resolved", href: "/moderator/complaints?status=RESOLVED", icon: <CheckCircle className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "My Zones", href: "/moderator/zones", icon: <MapPin className="w-4 h-4" /> },
      { label: "Notifications", href: "/moderator/notifications", icon: <Bell className="w-4 h-4" /> },
      { label: "Profile", href: "/moderator/profile", icon: <User className="w-4 h-4" /> },
      { label: "Support", href: "/moderator/support", icon: <HelpCircle className="w-4 h-4" /> },
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
    const anyActive = item.children.some(
      (c) => c.href && pathname.startsWith(c.href.split("?")[0])
    );
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            anyActive
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          <span className={cn("flex-shrink-0", anyActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400")}>
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
            {item.children.map((c) => <SideNavItem key={c.label} item={c} />)}
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
          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
      )}
    >
      <span className={cn("flex-shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400")}>
        {item.icon}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">{item.badge}</span>
      )}
    </Link>
  );
}

interface Props { open: boolean; onClose: () => void; }

export function ModeratorSidebar({ open, onClose }: Props) {
  const { user, logout } = useAuthStore();
  const { stats, zones } = useModeratorStore();
  const router = useRouter();
  const isMounted = useIsMounted();

  const activeUser = isMounted ? user : null;
  const name = activeUser
    ? `${(activeUser as any).first_name ?? ""} ${(activeUser as any).last_name ?? ""}`.trim() || activeUser.email?.split("@")[0]
    : "Moderator";

  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out."); router.replace("/"); }
    catch { toast.error("Logout failed."); }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <Link href="/moderator/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Moderator Hub</p>
            <p className="text-[10px] text-gray-400">Operations Center</p>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Profile strip */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
            <p className="text-[11px] text-gray-400">
              {zones.length > 0 ? `${zones.length} zone${zones.length > 1 ? "s" : ""}` : "No zones assigned"}
            </p>
          </div>
          {(stats?.pending_kyc_total ?? 0) > 0 && (
            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full flex-shrink-0">
              {stats!.pending_kyc_total}
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {NAV.map((section) => (
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
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden />
          <aside className="fixed left-0 top-0 z-50 flex w-60 flex-col h-full lg:hidden shadow-2xl">{sidebarContent}</aside>
        </>
      )}
    </>
  );
}

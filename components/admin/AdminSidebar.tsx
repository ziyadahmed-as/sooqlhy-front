"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard, Users, Store, Truck, ShieldCheck, Package,
  ShoppingBag, MessageSquare, DollarSign, BarChart2, Bell,
  Settings, FileText, Map, LogOut, ChevronDown, X, User,
  Shield, TrendingUp, Receipt, AlertTriangle, Search,
  CheckCircle, Clock, Globe,
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
      { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Analytics", href: "/admin/analytics", icon: <BarChart2 className="w-4 h-4" /> },
    ],
  },
  {
    section: "Users",
    items: [
      {
        label: "Users",
        icon: <Users className="w-4 h-4" />,
        children: [
          { label: "All Users", href: "/admin/users", icon: <Users className="w-4 h-4" /> },
          { label: "Vendors", href: "/admin/users?role=VENDOR", icon: <Store className="w-4 h-4" /> },
          { label: "Drivers", href: "/admin/users?role=DRIVER", icon: <Truck className="w-4 h-4" /> },
          { label: "Moderators", href: "/admin/users?role=MODERATOR", icon: <ShieldCheck className="w-4 h-4" /> },
          { label: "Customers", href: "/admin/users?role=BUYER", icon: <User className="w-4 h-4" /> },
          { label: "Suspended", href: "/admin/users?is_active=false", icon: <AlertTriangle className="w-4 h-4" /> },
        ],
      },
      { label: "KYC Review", href: "/admin/kyc", icon: <ShieldCheck className="w-4 h-4" /> },
    ],
  },
  {
    section: "Operations",
    items: [
      {
        label: "Products",
        icon: <Package className="w-4 h-4" />,
        children: [
          { label: "Moderation Queue", href: "/admin/products", icon: <Clock className="w-4 h-4" /> },
        ],
      },
      {
        label: "Orders",
        icon: <ShoppingBag className="w-4 h-4" />,
        children: [
          { label: "All Orders", href: "/admin/orders", icon: <ShoppingBag className="w-4 h-4" /> },
          { label: "Pending", href: "/admin/orders?status=PENDING", icon: <Clock className="w-4 h-4" /> },
          { label: "In Transit", href: "/admin/orders?status=SHIPPED", icon: <Truck className="w-4 h-4" /> },
          { label: "Delivered", href: "/admin/orders?status=DELIVERED", icon: <CheckCircle className="w-4 h-4" /> },
        ],
      },
      {
        label: "Complaints",
        icon: <MessageSquare className="w-4 h-4" />,
        children: [
          { label: "All Complaints", href: "/admin/complaints", icon: <MessageSquare className="w-4 h-4" /> },
          { label: "Escalated", href: "/admin/complaints?status=ESCALATED", icon: <AlertTriangle className="w-4 h-4" /> },
          { label: "New", href: "/admin/complaints?status=NEW", icon: <Clock className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    section: "Finance",
    items: [
      {
        label: "Finance",
        icon: <DollarSign className="w-4 h-4" />,
        children: [
          { label: "Overview", href: "/admin/finance", icon: <TrendingUp className="w-4 h-4" /> },
          { label: "Withdrawals", href: "/admin/finance/withdrawals", icon: <Receipt className="w-4 h-4" /> },
          { label: "Commission Rates", href: "/admin/finance/commissions", icon: <DollarSign className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Zone Management", href: "/admin/zones", icon: <Map className="w-4 h-4" /> },
      { label: "Moderator Zones", href: "/admin/moderators", icon: <Globe className="w-4 h-4" /> },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: <FileText className="w-4 h-4" /> },
      { label: "System Health", href: "/admin/system", icon: <Shield className="w-4 h-4" /> },
      { label: "Notifications", href: "/admin/notifications", icon: <Bell className="w-4 h-4" /> },
      { label: "Settings", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
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
    const anyActive = item.children.some((c) => c.href && pathname.startsWith(c.href.split("?")[0]));
    return (
      <div>
        <button onClick={() => setExpanded(!expanded)}
          className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            anyActive ? "text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white")}>
          <span className={cn("flex-shrink-0", anyActive ? "text-slate-700 dark:text-slate-300" : "text-gray-400")}>{item.icon}</span>
          <span className="flex-1 text-left">{item.label}</span>
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
    <Link href={item.href!}
      className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white")}>
      <span className={cn("flex-shrink-0", isActive ? "text-slate-700 dark:text-slate-300" : "text-gray-400")}>{item.icon}</span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">{item.badge}</span>}
    </Link>
  );
}

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const name = user ? `${(user as any).first_name ?? ""} ${(user as any).last_name ?? ""}`.trim() || user.email?.split("@")[0] : "Admin";
  const isSuperAdmin = (user?.role ?? "").toUpperCase() === "SUPER_ADMIN";

  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out."); router.replace("/"); }
    catch { toast.error("Logout failed."); }
  };

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-800 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Admin Center</p>
            <p className="text-[10px] text-gray-400">{isSuperAdmin ? "Super Admin" : "Administrator"}</p>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-4 h-4" /></button>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
            <p className="text-[11px] text-gray-400">{isSuperAdmin ? "Super Administrator" : "Administrator"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {NAV.map((section) => (
          <div key={section.section}>
            <p className="px-3 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{section.section}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => <SideNavItem key={item.label} item={item} />)}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800">
        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
          <LogOut className="w-4 h-4" />Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col h-full">{content}</aside>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden />
          <aside className="fixed left-0 top-0 z-50 flex w-64 flex-col h-full lg:hidden shadow-2xl">{content}</aside>
        </>
      )}
    </>
  );
}

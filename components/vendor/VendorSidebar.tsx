"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard, BarChart2, Package, Plus, Layers, Box, Image, Star,
  ShoppingBag, Clock, Zap, Truck, CheckCircle, XCircle, RotateCcw,
  Navigation, MapPin, Map, History,
  DollarSign, TrendingUp, Receipt, ArrowDownCircle, FileText,
  Users, MessageSquare, Bell, Store, Settings, Shield, HelpCircle,
  LogOut, ChevronDown, ChevronRight, X, User, Tag,
} from "lucide-react";
import { toast } from "sonner";

// ─── Nav structure ──────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
  badge?: number | string;
}

const NAV_SECTIONS: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/vendor/dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        label: "Analytics",
        href: "/vendor/analytics",
        icon: <BarChart2 className="w-4 h-4" />,
      },
    ],
  },
  {
    section: "Catalog",
    items: [
      {
        label: "Products",
        icon: <Package className="w-4 h-4" />,
        children: [
          { label: "All Products", href: "/vendor/products", icon: <Package className="w-4 h-4" /> },
          { label: "Add Product", href: "/vendor/products/new", icon: <Plus className="w-4 h-4" /> },
          { label: "Categories", href: "/vendor/categories", icon: <Tag className="w-4 h-4" /> },
          { label: "Inventory", href: "/vendor/inventory", icon: <Box className="w-4 h-4" /> },
          { label: "Product Images", href: "/vendor/products/images", icon: <Image className="w-4 h-4" /> },
          { label: "Product Reviews", href: "/vendor/reviews", icon: <Star className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    section: "Orders",
    items: [
      {
        label: "Orders",
        icon: <ShoppingBag className="w-4 h-4" />,
        children: [
          { label: "New Orders", href: "/vendor/orders?status=PENDING", icon: <Zap className="w-4 h-4" /> },
          { label: "Pending Orders", href: "/vendor/orders?status=PENDING", icon: <Clock className="w-4 h-4" /> },
          { label: "Processing", href: "/vendor/orders?status=PROCESSING", icon: <Zap className="w-4 h-4" /> },
          { label: "Ready for Pickup", href: "/vendor/orders?status=SHIPPED", icon: <CheckCircle className="w-4 h-4" /> },
          { label: "Delivered", href: "/vendor/orders?status=DELIVERED", icon: <CheckCircle className="w-4 h-4" /> },
          { label: "Cancelled", href: "/vendor/orders?status=CANCELLED", icon: <XCircle className="w-4 h-4" /> },
          { label: "Returned", href: "/vendor/orders?status=REFUNDED", icon: <RotateCcw className="w-4 h-4" /> },
          { label: "All Orders", href: "/vendor/orders", icon: <ShoppingBag className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    section: "Delivery",
    items: [
      {
        label: "Delivery",
        icon: <Truck className="w-4 h-4" />,
        children: [
          { label: "Assign Driver", href: "/vendor/delivery/assign", icon: <Navigation className="w-4 h-4" /> },
          { label: "Active Deliveries", href: "/vendor/delivery/active", icon: <Truck className="w-4 h-4" /> },
          { label: "Delivery Tracking", href: "/vendor/delivery/tracking", icon: <MapPin className="w-4 h-4" /> },
          { label: "Delivery History", href: "/vendor/delivery/history", icon: <History className="w-4 h-4" /> },
          { label: "Available Drivers", href: "/vendor/delivery/drivers", icon: <Users className="w-4 h-4" /> },
          { label: "Delivery Zones", href: "/vendor/delivery/zones", icon: <Map className="w-4 h-4" /> },
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
          { label: "Revenue", href: "/vendor/finance", icon: <TrendingUp className="w-4 h-4" /> },
          { label: "Transactions", href: "/vendor/finance/transactions", icon: <Receipt className="w-4 h-4" /> },
          { label: "Withdrawals", href: "/vendor/finance/withdrawals", icon: <ArrowDownCircle className="w-4 h-4" /> },
          { label: "Payout History", href: "/vendor/finance/payouts", icon: <History className="w-4 h-4" /> },
          { label: "Invoices", href: "/vendor/finance/invoices", icon: <FileText className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    section: "Customers",
    items: [
      { label: "Customers", href: "/vendor/customers", icon: <Users className="w-4 h-4" /> },
      { label: "Reviews", href: "/vendor/reviews", icon: <Star className="w-4 h-4" /> },
      { label: "Messages", href: "/vendor/messages", icon: <MessageSquare className="w-4 h-4" /> },
    ],
  },
  {
    section: "Store",
    items: [
      {
        label: "Store",
        icon: <Store className="w-4 h-4" />,
        children: [
          { label: "Store Profile", href: "/vendor/store/profile", icon: <Store className="w-4 h-4" /> },
          { label: "Store Settings", href: "/vendor/store/settings", icon: <Settings className="w-4 h-4" /> },
          { label: "Business Info", href: "/vendor/store/business", icon: <FileText className="w-4 h-4" /> },
          { label: "KYC Status", href: "/vendor/store/kyc", icon: <Shield className="w-4 h-4" /> },
        ],
      },
    ],
  },
];

// ─── NavItem renderer ──────────────────────────────────────────────────────

function SideNavItem({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(() => {
    if (!item.children) return false;
    return item.children.some((c) => c.href && pathname.startsWith(c.href.split("?")[0]));
  });

  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href.split("?")[0] + "/") : false;

  if (item.children) {
    const anyChildActive = item.children.some(
      (c) => c.href && (pathname === c.href.split("?")[0] || pathname.startsWith(c.href.split("?")[0] + "/"))
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
          {item.badge && (
            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
              {item.badge}
            </span>
          )}
          <ChevronDown
            className={cn("w-3.5 h-3.5 transition-transform flex-shrink-0", expanded ? "rotate-180" : "")}
          />
        </button>
        {expanded && (
          <div className="ml-3 mt-0.5 pl-3 border-l border-gray-200 dark:border-gray-700 space-y-0.5">
            {item.children.map((child) => (
              <SideNavItem key={child.label} item={child} depth={depth + 1} />
            ))}
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
      {item.badge && (
        <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────

interface VendorSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function VendorSidebar({ open, onClose }: VendorSidebarProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully.");
      router.replace("/");
    } catch {
      toast.error("Failed to log out.");
    }
  };

  const vendorName =
    (user as any)?.first_name
      ? `${(user as any).first_name} ${(user as any).last_name ?? ""}`.trim()
      : user?.name || user?.email?.split("@")[0] || "Vendor";

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo / Brand */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <Link href="/vendor/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Seller Center</p>
            <p className="text-[10px] text-gray-400">Vendor Dashboard</p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Vendor Profile Summary */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {vendorName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{vendorName}</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <p className="text-[11px] text-gray-400">Verified Vendor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.section}>
            <p className="px-3 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {section.section}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SideNavItem key={item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800 space-y-0.5">
        <Link
          href="/vendor/notifications"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Bell className="w-4 h-4 text-gray-400" />
          Notifications
        </Link>
        <Link
          href="/vendor/support"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-gray-400" />
          Support
        </Link>
        <Link
          href="/vendor/profile"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <User className="w-4 h-4 text-gray-400" />
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col h-full">{sidebarContent}</aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-0 z-50 flex w-60 flex-col h-full lg:hidden shadow-2xl">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

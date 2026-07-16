"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useDriverStore } from "@/stores/driver-store";
import { Menu, Bell, ChevronDown, LogOut, User, Moon, Sun, ExternalLink, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: seg.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));
  return (
    <nav className="hidden sm:flex items-center gap-1 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i < crumbs.length - 1 ? (
            <>
              <Link href={crumb.href} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">{crumb.label}</Link>
              <span className="text-gray-300 dark:text-gray-600">/</span>
            </>
          ) : (
            <span className="font-semibold text-gray-800 dark:text-gray-200">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function NotificationBell() {
  const { notifications, unreadCount, loadNotifications, markAllRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30_000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Notifications">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Notifications
              {unreadCount > 0 && <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">{unreadCount} new</span>}
            </p>
            {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Mark all read</button>}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">No notifications yet</div>
            ) : notifications.slice(0, 10).map((n) => (
              <div key={n.id} className={cn("flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors", !n.is_read && "bg-blue-50/50 dark:bg-blue-900/10")}>
                <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", n.is_read ? "bg-gray-200 dark:bg-gray-700" : "bg-blue-500")} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{n.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <Link href="/driver/notifications" onClick={() => setOpen(false)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View all notifications <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileMenu() {
  const { user, logout } = useAuthStore();
  const { profile } = useDriverStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const name = user
    ? `${(user as any).first_name ?? ""} ${(user as any).last_name ?? ""}`.trim() || user.email?.split("@")[0]
    : "Driver";

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
      toast.success("Logged out successfully.");
      router.replace("/");
    } catch {
      toast.error("Failed to log out.");
    }
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        {profile?.profile_photo ? (
          <img src={profile.profile_photo} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {(name ?? "D").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{name}</p>
          <p className="text-[10px] text-gray-400 leading-none mt-0.5">Driver</p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-52 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl py-1">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <Link href="/driver/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <User className="w-4 h-4 text-gray-400" /> My Profile
          </Link>
          <Link href="/auth/kyc" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Truck className="w-4 h-4 text-gray-400" /> KYC Status
          </Link>
          <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DriverTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };
  return (
    <header className="flex items-center gap-4 h-14 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Open menu">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0"><Breadcrumb /></div>
      <div className="flex items-center gap-1">
        <button onClick={toggleDark} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle dark mode">
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <NotificationBell />
        <ProfileMenu />
      </div>
    </header>
  );
}

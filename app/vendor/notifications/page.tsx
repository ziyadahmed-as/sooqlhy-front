"use client";
import { useEffect } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { useNotificationStore } from "@/stores/notification-store";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

export default function VendorNotificationsPage() {
  const { notifications, loading, unreadCount, loadNotifications, markAllRead, markOneRead } =
    useNotificationStore();

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  return (
    <VendorPageWrapper
      title="Notifications"
      subtitle="Stay up to date with your store activity."
      actions={
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={loadNotifications}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up. New notifications will appear here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markOneRead(n.id)}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                n.is_read
                  ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                n.is_read ? "bg-gray-200 dark:bg-gray-700" : "bg-blue-500"
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", n.is_read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white")}>
                  {n.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full flex-shrink-0">
                  NEW
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </VendorPageWrapper>
  );
}

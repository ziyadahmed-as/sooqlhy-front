"use client";
import { useEffect } from "react";
import { useNotificationStore } from "@/stores/notification-store";
import { ModeratorPageWrapper } from "@/components/moderator/ModeratorPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bell, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ModeratorNotificationsPage() {
  const { notifications, loading, unreadCount, loadNotifications, markAllRead, markOneRead } = useNotificationStore();
  useEffect(() => { loadNotifications(); }, [loadNotifications]);
  return (
    <ModeratorPageWrapper title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
      actions={
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <button onClick={markAllRead} className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 rounded-lg transition-colors">Mark all read</button>}
          <button onClick={loadNotifications} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>
        </div>
      }>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? <div className="p-4 space-y-2">{[1,2,3,4].map((i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
          : notifications.length === 0 ? <EmptyState title="No notifications" description="KYC submissions, complaints, and system alerts appear here." icon={<Bell className="h-10 w-10" />} />
          : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {notifications.map((n) => (
                <div key={n.id} onClick={() => !n.is_read && markOneRead(n.id)}
                  className={cn("flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors", !n.is_read && "bg-indigo-50/60 dark:bg-indigo-900/10")}>
                  <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", n.is_read ? "bg-gray-300 dark:bg-gray-600" : "bg-indigo-500")} />
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-semibold", n.is_read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white")}>{n.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />}
                </div>
              ))}
            </div>
          )}
      </div>
    </ModeratorPageWrapper>
  );
}

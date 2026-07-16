"use client";
import { useState } from "react";
import { useNotificationStore } from "@/stores/notification-store";
import { broadcastNotification } from "@/lib/api/admin";
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bell, Send, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ROLES = ["", "VENDOR", "DRIVER", "MODERATOR", "BUYER", "ADMIN"];

export default function AdminNotificationsPage() {
  const { notifications, loading, unreadCount, loadNotifications, markAllRead, markOneRead } = useNotificationStore();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) { toast.error("Title and message required"); return; }
    if (!confirm(`Send broadcast to ${role ? role : "ALL users"}?`)) return;
    setSending(true);
    try {
      const res = await broadcastNotification(title, message, role || undefined);
      toast.success(res.detail);
      setTitle(""); setMessage(""); setRole("");
    } catch { toast.error("Failed to send broadcast"); } finally { setSending(false); }
  };

  return (
    <AdminPageWrapper title="Notifications" subtitle="System notifications and broadcast messaging."
      actions={
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <button onClick={markAllRead} className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:border-slate-400 rounded-lg transition-colors">Mark all read</button>}
          <button onClick={loadNotifications} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>
        </div>
      }>

      {/* Broadcast form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Send className="w-4 h-4 text-slate-500" />Broadcast Notification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title..."
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Target Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500">
              {ROLES.map((r) => <option key={r} value={r}>{r || "All Users"}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Notification message..."
            className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none" />
        </div>
        <button onClick={handleBroadcast} disabled={!title.trim() || !message.trim() || sending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-bold hover:bg-slate-900 disabled:opacity-50 transition-colors">
          <Send className="w-4 h-4" />{sending ? "Sending..." : `Send to ${role || "All Users"}`}
        </button>
      </div>

      {/* Own notifications */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Bell className="w-4 h-4 text-slate-500" />My Notifications {unreadCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">{unreadCount} new</span>}</h3>
        </div>
        {loading ? <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
          : notifications.length === 0 ? <EmptyState title="No notifications" description="System alerts and broadcast messages appear here." icon={<Bell className="h-10 w-10" />} />
          : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {notifications.map((n) => (
                <div key={n.id} onClick={() => !n.is_read && markOneRead(n.id)}
                  className={cn("flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors", !n.is_read && "bg-slate-50/60 dark:bg-slate-900/10")}>
                  <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", n.is_read ? "bg-gray-300 dark:bg-gray-600" : "bg-slate-600")} />
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-semibold", n.is_read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white")}>{n.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </AdminPageWrapper>
  );
}

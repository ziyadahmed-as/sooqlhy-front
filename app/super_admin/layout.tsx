"use client";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminGuard } from "@/components/layout/AdminGuard";
import { useNotificationStore } from "@/stores/notification-store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loadNotifications } = useNotificationStore();

  useEffect(() => {
    loadNotifications();
    const t = setInterval(loadNotifications, 60_000);
    return () => clearInterval(t);
  }, [loadNotifications]);

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}

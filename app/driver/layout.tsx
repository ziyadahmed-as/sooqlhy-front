"use client";
import { useEffect, useState } from "react";
import { DriverSidebar } from "@/components/driver/DriverSidebar";
import { DriverTopbar } from "@/components/driver/DriverTopbar";
import { DriverGuard } from "@/components/layout/DriverGuard";
import { useDriverStore } from "@/stores/driver-store";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loadAll } = useDriverStore();

  // Load driver profile + stats on mount
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <DriverGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        <DriverSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <DriverTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
            {children}
          </main>
        </div>
      </div>
    </DriverGuard>
  );
}

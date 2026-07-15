"use client";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";
import { VendorTopbar } from "@/components/vendor/VendorTopbar";
import { VendorGuard } from "@/components/layout/VendorGuard";
import { useState } from "react";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <VendorGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <VendorSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Top bar */}
          <VendorTopbar onMenuClick={() => setSidebarOpen(true)} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
            {children}
          </main>
        </div>
      </div>
    </VendorGuard>
  );
}

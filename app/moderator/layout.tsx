"use client";
import { useEffect, useState } from "react";
import { ModeratorSidebar } from "@/components/moderator/ModeratorSidebar";
import { ModeratorTopbar } from "@/components/moderator/ModeratorTopbar";
import { ModeratorGuard } from "@/components/layout/ModeratorGuard";
import { useModeratorStore } from "@/stores/moderator-store";

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loadAll } = useModeratorStore();
  useEffect(() => { loadAll(); }, [loadAll]);
  return (
    <ModeratorGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        <ModeratorSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <ModeratorTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">{children}</main>
        </div>
      </div>
    </ModeratorGuard>
  );
}

"use client";
import { useAuthStore } from "@/stores/auth-store";
import { useModeratorStore } from "@/stores/moderator-store";
import { ModeratorPageWrapper } from "@/components/moderator/ModeratorPageWrapper";
import { User, MapPin, Shield } from "lucide-react";

export default function ModeratorProfilePage() {
  const { user } = useAuthStore();
  const { zones } = useModeratorStore();
  const name = user ? `${(user as any).first_name ?? ""} ${(user as any).last_name ?? ""}`.trim() || user.email?.split("@")[0] : "Moderator";
  return (
    <ModeratorPageWrapper title="My Profile" subtitle="Your moderator account information.">
      <div className="max-w-2xl space-y-5">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl">{name.charAt(0).toUpperCase()}</div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                <Shield className="w-3 h-3" />Moderator
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Role", value: "MODERATOR" },
              { label: "Email", value: user?.email ?? "—" },
              { label: "Zones", value: `${zones.length} assigned` },
              { label: "Account Status", value: user?.is_active !== false ? "Active" : "Suspended" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
        {zones.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-500" />Assigned Zones</h3>
            <div className="space-y-2">
              {zones.map((z) => (
                <div key={z.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{z.zone_name}</p>
                  <p className="text-xs text-gray-400">{z.zone_city}, {z.zone_country}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModeratorPageWrapper>
  );
}

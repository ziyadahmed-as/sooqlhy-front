"use client";
import { useAuthStore } from "@/stores/auth-store";
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { Shield, User, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const name = user ? `${(user as any).first_name ?? ""} ${(user as any).last_name ?? ""}`.trim() || user.email?.split("@")[0] : "Admin";
  const isSuperAdmin = (user?.role ?? "").toUpperCase() === "SUPER_ADMIN";

  return (
    <AdminPageWrapper title="Settings" subtitle="Platform configuration and administrator profile.">
      <div className="max-w-2xl space-y-5">
        {/* Admin profile card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-black text-2xl">{name.charAt(0).toUpperCase()}</div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${isSuperAdmin ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" : "bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300"}`}>
                <Shield className="w-3 h-3" />{isSuperAdmin ? "Super Administrator" : "Administrator"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Role", value: user?.role ?? "—" }, { label: "Email", value: user?.email ?? "—" }, { label: "Account Status", value: user?.is_active !== false ? "Active" : "Suspended" }, { label: "Access Level", value: isSuperAdmin ? "Full Access" : "Admin Access" }].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform settings (informational) */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-slate-500" />Platform Configuration</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Advanced platform settings such as commission rates, delivery zones, and notification templates can be managed through their dedicated pages in the sidebar navigation.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
            {[["Commission Rates", "/admin/finance/commissions"], ["Delivery Zones", "/admin/zones"], ["Moderator Zones", "/admin/moderators"], ["System Health", "/admin/system"]].map(([label, href]) => (
              <li key={label}><a href={href} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">→ {label}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </AdminPageWrapper>
  );
}

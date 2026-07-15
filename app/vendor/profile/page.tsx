"use client";
import { useState } from "react";
import { User, Save, KeyRound } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { toast } from "sonner";

export default function VendorProfilePage() {
  const { user, changePassword, refreshUser } = useAuthStore();
  const [saving, setSaving]   = useState(false);
  const [pwForm, setPwForm]   = useState({ old_password: "", new_password: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  const vendorName =
    (user as any)?.first_name
      ? `${(user as any).first_name} ${(user as any).last_name ?? ""}`.trim()
      : user?.name || user?.email?.split("@")[0] || "Vendor";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(pwForm.old_password, pwForm.new_password);
      toast.success("Password updated successfully");
      setPwForm({ old_password: "", new_password: "", confirm: "" });
    } catch (e: any) {
      toast.error(e?.response?.data?.old_password?.[0] || "Failed to update password");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <VendorPageWrapper title="Profile" subtitle="Manage your account information and security.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {vendorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{vendorName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">KYC Verified</span>
              <span className={user?.is_verified ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                {user?.is_verified ? "✓ Verified" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-gray-400" /> Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { key: "old_password", label: "Current Password" },
              { key: "new_password", label: "New Password" },
              { key: "confirm",      label: "Confirm New Password" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
                <input
                  type="password"
                  value={(pwForm as any)[key]}
                  onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                  required
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={savingPw}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {savingPw ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </VendorPageWrapper>
  );
}

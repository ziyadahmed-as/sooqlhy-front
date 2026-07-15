"use client";
import { useCallback, useEffect, useState } from "react";
import { Store, RefreshCw, Save, Camera } from "lucide-react";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/stores/auth-store";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VendorProfileData {
  store_name: string;
  business_name: string;
  business_type: string;
  category: string;
  store_description: string;
  verification_status: string;
  subscription_tier: string;
}

export default function StoreProfilePage() {
  const { user, refreshUser } = useAuthStore();
  const [profile, setProfile] = useState<VendorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState<Partial<VendorProfileData>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/users/vendor-profiles/");
      const profiles = Array.isArray(data) ? data : data.results ?? [];
      const mine = profiles[0] ?? null;
      setProfile(mine);
      setForm({
        store_name: mine?.store_name || "",
        business_name: mine?.business_name || "",
        business_type: mine?.business_type || "",
        category: mine?.category || "",
        store_description: mine?.store_description || "",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/users/vendor-profiles/", form);
      toast.success("Store profile updated");
      await refreshUser();
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <VendorPageWrapper
      title="Store Profile"
      subtitle="Update your store information and branding."
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Store logo placeholder */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 text-center space-y-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto text-white text-4xl font-bold">
                {(form.store_name || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{form.store_name || "Your Store"}</p>
                <span className={cn("inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full", {
                  "VERIFIED": "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
                  "PENDING_VERIFICATION": "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
                }[profile?.verification_status ?? ""] ?? "text-gray-500 bg-gray-100 dark:bg-gray-800")}>
                  {profile?.verification_status?.replace(/_/g, " ") ?? "Pending"}
                </span>
              </div>
              <p className="text-xs text-gray-400">Plan: <span className="font-semibold text-gray-700 dark:text-gray-300">{profile?.subscription_tier ?? "BRONZE"}</span></p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Store Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "store_name", label: "Store Name", required: true },
                { key: "business_name", label: "Business Name" },
                { key: "business_type", label: "Business Type" },
                { key: "category", label: "Category" },
              ].map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={(form as any)[key] || ""}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={required}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Store Description</label>
              <textarea
                value={form.store_description || ""}
                onChange={(e) => setForm({ ...form, store_description: e.target.value })}
                rows={4}
                placeholder="Tell customers about your store…"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </VendorPageWrapper>
  );
}

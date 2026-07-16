"use client";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Save } from "lucide-react";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/stores/auth-store";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProfileData {
  store_name: string;
  business_name: string;
  business_type: string;
  category: string;
  store_description: string;
  verification_status: string;
  subscription_tier: string;
}

const EMPTY: ProfileData = {
  store_name: "",
  business_name: "",
  business_type: "",
  category: "",
  store_description: "",
  verification_status: "",
  subscription_tier: "BRONZE",
};

const STATUS_BADGE: Record<string, string> = {
  VERIFIED:              "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  PENDING_VERIFICATION:  "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  UNDER_REVIEW:          "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  SUSPENDED:             "text-red-600 bg-red-50 dark:bg-red-900/20",
};

export default function StoreProfilePage() {
  const { refreshUser } = useAuthStore();
  const [form, setForm]     = useState<ProfileData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/users/vendor-profile/me/");
      setForm({
        store_name:        data.store_name        || "",
        business_name:     data.business_name     || "",
        business_type:     data.business_type     || "",
        category:          data.category          || "",
        store_description: data.store_description || "",
        verification_status: data.verification_status || "",
        subscription_tier:   data.subscription_tier   || "BRONZE",
      });
    } catch {
      // profile may not exist yet — stay with empty defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/users/vendor-profile/me/", {
        store_name:        form.store_name,
        business_name:     form.business_name,
        business_type:     form.business_type,
        category:          form.category,
        store_description: form.store_description,
      });
      toast.success("Store profile updated");
      await refreshUser();
    } catch (err: unknown) {
      toast.error((err as any)?.response?.data?.detail || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <VendorPageWrapper
      title="Store Profile"
      subtitle="Update your store information and branding."
      actions={
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
          <div className="lg:col-span-2 h-64 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Store card ── */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 text-center space-y-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto text-white text-4xl font-bold select-none">
              {(form.store_name || "S").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {form.store_name || "Your Store"}
              </p>
              {form.verification_status && (
                <span
                  className={cn(
                    "inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                    STATUS_BADGE[form.verification_status] ?? "text-gray-500 bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  {form.verification_status.replace(/_/g, " ")}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Plan:{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {form.subscription_tier}
              </span>
            </p>
          </div>

          {/* ── Edit form ── */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-5"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Store Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  { key: "store_name",    label: "Store Name",     required: true },
                  { key: "business_name", label: "Business Name" },
                  { key: "business_type", label: "Business Type" },
                  { key: "category",      label: "Category" },
                ] as { key: keyof ProfileData; label: string; required?: boolean }[]
              ).map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={set(key)}
                    required={required}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Store Description
              </label>
              <textarea
                value={form.store_description}
                onChange={set("store_description")}
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

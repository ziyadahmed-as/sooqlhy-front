"use client";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Save } from "lucide-react";
import api from "@/lib/api/axios";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BizForm {
  business_name: string;
  business_type: string;
  category: string;
  store_name: string;
  store_description: string;
}

const EMPTY: BizForm = {
  business_name: "",
  business_type: "",
  category: "",
  store_name: "",
  store_description: "",
};

export default function BusinessInfoPage() {
  const [form, setForm]     = useState<BizForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/users/vendor-profile/me/");
      setForm({
        business_name:     data.business_name     || "",
        business_type:     data.business_type     || "",
        category:          data.category          || "",
        store_name:        data.store_name        || "",
        store_description: data.store_description || "",
      });
    } catch {
      // no profile yet — keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/users/vendor-profile/me/", form);
      toast.success("Business info updated");
    } catch (err: unknown) {
      toast.error((err as any)?.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof BizForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const fields: { key: keyof BizForm; label: string; placeholder: string }[] = [
    { key: "business_name", label: "Business Name",      placeholder: "Your legal business name" },
    { key: "business_type", label: "Business Type",      placeholder: "e.g. Sole Trader, LLC" },
    { key: "category",      label: "Business Category",  placeholder: "e.g. Electronics, Fashion" },
    { key: "store_name",    label: "Store Display Name", placeholder: "Name customers see" },
  ];

  return (
    <VendorPageWrapper
      title="Business Information"
      subtitle="Keep your business details accurate for compliance and payments."
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
        <div className="max-w-2xl space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="max-w-2xl bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  {label}
                </label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Store Description
            </label>
            <textarea
              rows={3}
              value={form.store_description}
              onChange={set("store_description")}
              placeholder="Describe your store to customers…"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
      )}
    </VendorPageWrapper>
  );
}

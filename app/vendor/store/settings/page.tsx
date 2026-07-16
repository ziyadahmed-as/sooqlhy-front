"use client";
import { useState } from "react";
import { Settings, Save, Bell, Shield, Globe } from "lucide-react";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SettingsState {
  emailNotifications: boolean;
  orderAlerts: boolean;
  lowStockAlerts: boolean;
  reviewAlerts: boolean;
  language: string;
  currency: string;
  timezone: string;
}

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    orderAlerts: true,
    lowStockAlerts: true,
    reviewAlerts: true,
    language: "en",
    currency: "USD",
    timezone: "UTC",
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof SettingsState) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    toast.success("Settings saved");
  };

  return (
    <VendorPageWrapper
      title="Store Settings"
      subtitle="Configure notifications, language and regional preferences."
    >
      <div className="max-w-2xl space-y-6">
        {/* Notifications */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {[
              { key: "emailNotifications", label: "Email Notifications", description: "Receive all store updates via email" },
              { key: "orderAlerts",        label: "New Order Alerts",    description: "Get notified when a new order is placed" },
              { key: "lowStockAlerts",     label: "Low Stock Alerts",    description: "Alert when product stock falls below threshold" },
              { key: "reviewAlerts",       label: "Review Alerts",       description: "Get notified when customers leave reviews" },
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
                </div>
                <button
                  onClick={() => toggle(key as keyof SettingsState)}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    (settings as any)[key] ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                  )}
                  role="switch"
                  aria-checked={(settings as any)[key]}
                >
                  <span
                    className={cn(
                      "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                      (settings as any)[key] ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Regional */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Regional Settings</h3>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: "language", label: "Language",  options: [{ v: "en", l: "English" }, { v: "ar", l: "Arabic" }, { v: "fr", l: "French" }] },
              { key: "currency", label: "Currency",  options: [{ v: "USD", l: "USD ($)" }, { v: "ETB", l: "ETB (Br)" }, { v: "EUR", l: "EUR (€)" }] },
              { key: "timezone", label: "Timezone",  options: [{ v: "UTC", l: "UTC" }, { v: "Africa/Addis_Ababa", l: "Addis Ababa" }, { v: "America/New_York", l: "New York" }] },
            ].map(({ key, label, options }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
                <select
                  value={(settings as any)[key]}
                  onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {options.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>
    </VendorPageWrapper>
  );
}

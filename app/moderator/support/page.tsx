"use client";
import { ModeratorPageWrapper } from "@/components/moderator/ModeratorPageWrapper";
import { HelpCircle, Mail, Shield } from "lucide-react";
export default function ModeratorSupportPage() {
  return (
    <ModeratorPageWrapper title="Support" subtitle="Get help with moderation tasks.">
      <div className="max-w-2xl space-y-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center"><HelpCircle className="w-5 h-5 text-indigo-600" /></div>
            <div><p className="font-semibold text-gray-900 dark:text-white">Moderator Support</p><p className="text-xs text-gray-400">Available during business hours</p></div>
          </div>
          <div className="space-y-3">
            <a href="mailto:moderator-support@sooqly.com" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Mail className="w-5 h-5 text-gray-400" />
              <div><p className="text-sm font-medium text-gray-900 dark:text-white">Email Support</p><p className="text-xs text-gray-400">moderator-support@sooqly.com</p></div>
            </a>
            <a href="mailto:admin@sooqly.com" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Shield className="w-5 h-5 text-gray-400" />
              <div><p className="text-sm font-medium text-gray-900 dark:text-white">Contact Admin</p><p className="text-xs text-gray-400">admin@sooqly.com</p></div>
            </a>
          </div>
        </div>
      </div>
    </ModeratorPageWrapper>
  );
}

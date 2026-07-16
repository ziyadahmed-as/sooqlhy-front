"use client";
import { DriverPageWrapper } from "@/components/driver/DriverPageWrapper";
import { HelpCircle, Mail, MessageSquare } from "lucide-react";

export default function DriverSupportPage() {
  return (
    <DriverPageWrapper title="Support" subtitle="Get help with your deliveries and account.">
      <div className="max-w-2xl space-y-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Driver Support Center</p>
              <p className="text-xs text-gray-400">Available 24/7</p>
            </div>
          </div>
          <div className="space-y-3">
            <a href="mailto:driver-support@sooqly.com" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Email Support</p>
                <p className="text-xs text-gray-400">driver-support@sooqly.com</p>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Live Chat</p>
                <p className="text-xs text-gray-400">Chat with a support agent</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </DriverPageWrapper>
  );
}

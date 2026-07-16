"use client";
import { HelpCircle, Mail, MessageCircle, BookOpen, ExternalLink } from "lucide-react";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";

const HELP_ITEMS = [
  { icon: BookOpen,        title: "Documentation",       description: "Read the vendor guide and API docs.", href: "#", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
  { icon: MessageCircle,   title: "Live Chat",            description: "Chat with our support team in real time.", href: "#", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
  { icon: Mail,            title: "Email Support",        description: "Send us an email at support@sooqly.com.", href: "mailto:support@sooqly.com", color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20" },
  { icon: HelpCircle,      title: "FAQ",                  description: "Find answers to common questions.", href: "#", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
];

export default function VendorSupportPage() {
  return (
    <VendorPageWrapper
      title="Support"
      subtitle="Get help with your vendor account and store management."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {HELP_ITEMS.map(({ icon: Icon, title, description, href, color }) => (
          <a
            key={title}
            href={href}
            target={href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                {title}
                <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
            </div>
          </a>
        ))}
      </div>
    </VendorPageWrapper>
  );
}

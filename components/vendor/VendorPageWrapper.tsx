"use client";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface VendorPageWrapperProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function VendorPageWrapper({
  title,
  subtitle,
  actions,
  children,
  className,
}: VendorPageWrapperProps) {
  return (
    <div className={cn("p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto", className)}>
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconColor?: string;
  iconBg?: string;
  trend?: number; // percentage change
  trendLabel?: string;
  href?: string;
  alert?: boolean;
  loading?: boolean;
  className?: string;
}

export function DashboardCard({
  title,
  value,
  icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50 dark:bg-blue-900/20",
  trend,
  trendLabel,
  href,
  alert,
  loading,
  className,
}: DashboardCardProps) {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNeutral = trend === 0;

  const inner = (
    <div
      className={cn(
        "relative bg-white dark:bg-gray-900 rounded-xl border p-4 shadow-sm transition-all",
        href && "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        alert
          ? "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10"
          : "border-gray-200 dark:border-gray-800",
        loading && "animate-pulse",
        className
      )}
    >
      {loading ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
              <span className={iconColor}>{icon}</span>
            </div>
            {trend !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full",
                  trendPositive
                    ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                    : trendNeutral
                    ? "text-gray-500 bg-gray-100 dark:bg-gray-800"
                    : "text-red-500 bg-red-50 dark:bg-red-900/20"
                )}
              >
                {trendPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : trendNeutral ? (
                  <Minus className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend > 0 ? "+" : ""}
                {trend}%
              </div>
            )}
          </div>
          <p
            className={cn(
              "text-2xl font-bold",
              alert ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
            )}
          >
            {value}
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{title}</p>
          {trendLabel && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{trendLabel}</p>
          )}
        </>
      )}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

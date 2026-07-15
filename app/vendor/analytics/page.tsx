"use client";
import dynamic from "next/dynamic";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { BarChart2 } from "lucide-react";

const AnalyticsDashboard = dynamic(
  () => import("@/components/vendor/AnalyticsDashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function VendorAnalyticsPage() {
  return (
    <VendorPageWrapper
      title="Analytics"
      subtitle="Comprehensive sales, product and customer analytics for your store."
    >
      <AnalyticsDashboard />
    </VendorPageWrapper>
  );
}

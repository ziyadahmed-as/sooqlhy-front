"use client";
import { useCallback, useEffect, useState } from "react";
import { Shield, RefreshCw, CheckCircle, Clock, XCircle, AlertTriangle, FileText } from "lucide-react";
import { fetchMyKycStatus, type VendorKycStatus } from "@/lib/api/vendor";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  APPROVED:     { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800", label: "Verified" },
  PENDING:      { icon: Clock,       color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",     label: "Under Review" },
  UNDER_REVIEW: { icon: Clock,       color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",     label: "Under Review" },
  REJECTED:     { icon: XCircle,     color: "text-red-600",     bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",             label: "Rejected" },
  NOT_SUBMITTED:{ icon: AlertTriangle, color: "text-gray-500",  bg: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",            label: "Not Submitted" },
};

export default function KycStatusPage() {
  const [kyc, setKyc]       = useState<VendorKycStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyKycStatus();
      setKyc(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cfg = STATUS_CONFIG[kyc?.status ?? "NOT_SUBMITTED"] ?? STATUS_CONFIG.NOT_SUBMITTED;
  const Icon = cfg.icon;

  return (
    <VendorPageWrapper
      title="KYC Status"
      subtitle="Your identity verification status."
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {loading ? (
        <div className="h-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
      ) : (
        <div className="max-w-lg">
          <div className={cn("rounded-xl border p-6 space-y-4", cfg.bg)}>
            <div className="flex items-center gap-4">
              <Icon className={cn("w-10 h-10", cfg.color)} />
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{cfg.label}</p>
                {kyc?.kyc_type && <p className="text-sm text-gray-500">Document: {kyc.kyc_type.replace(/_/g, " ")}</p>}
                {kyc?.submitted_at && <p className="text-xs text-gray-400 mt-0.5">Submitted: {new Date(kyc.submitted_at).toLocaleDateString()}</p>}
              </div>
            </div>

            {kyc?.status === "REJECTED" && kyc.rejection_reason && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase mb-1">Rejection Reason</p>
                <p className="text-sm text-red-800 dark:text-red-300">{kyc.rejection_reason}</p>
              </div>
            )}

            {kyc?.status === "APPROVED" && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                Your account is fully verified. You have full access to all dashboard features.
              </div>
            )}

            {(kyc?.status === "NOT_SUBMITTED" || kyc?.status === "REJECTED") && (
              <Link
                href="/auth/kyc"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                {kyc?.status === "REJECTED" ? "Resubmit Documents" : "Start KYC Verification"}
              </Link>
            )}
          </div>
        </div>
      )}
    </VendorPageWrapper>
  );
}

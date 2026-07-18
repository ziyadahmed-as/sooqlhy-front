// app/auth/kyc/page.tsx  — KYC Hub
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, AlertCircle, XCircle, LogOut, RefreshCw } from "lucide-react";
import axios from "@/lib/api/axios";
import { useAuthStore } from "@/stores/auth-store";
import { KycRequirement } from "@/lib/types/kyc";
import VendorKycForm from "@/components/kyc/VendorKycForm";
import DriverKycForm from "@/components/kyc/DriverKycForm";

// ─── The hub evaluates kyc_status and renders the right UI ───────────────────
export default function KycHub() {
  const router = useRouter();
  const { user, accessToken, refreshUser, logout } = useAuthStore();
  const [requirements, setRequirements] = useState<KycRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!accessToken || !user) return;

    const kycStatus = user.kyc_status || "NOT_SUBMITTED";
    const role = user.role?.toUpperCase();

    // Verified users should never land here — push to their dashboard
    if (kycStatus === "VERIFIED") {
      const dest = role === "DRIVER" ? "/driver/dashboard" : "/vendor/dashboard";
      router.replace(dest);
      return;
    }

    // For states that require document upload, fetch requirements first
    if (["NOT_SUBMITTED", "REQUEST_DOCS", "REJECTED"].includes(kycStatus)) {
      axios
        .get<KycRequirement[]>("/api/kyc/me/requirements/")
        .then((res) => setRequirements(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [accessToken, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-400/30 border-t-blue-400 animate-spin" />
          <p className="text-blue-200 text-sm">Loading your KYC status…</p>
        </div>
      </div>
    );
  }

  const kycStatus = user.kyc_status || "NOT_SUBMITTED";
  const role = user.role?.toUpperCase();

  // ── Active submission wizard (new, rejected, or re-upload needed) ───────────
  if (["NOT_SUBMITTED", "REQUEST_DOCS", "REJECTED"].includes(kycStatus)) {
    if (role === "DRIVER") {
      return <DriverKycForm requirements={requirements} />;
    }
    return <VendorKycForm requirements={requirements} />;
  }

  // ── Status pages for terminal / waiting states ──────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {kycStatus === "PENDING" || kycStatus === "UNDER_REVIEW" ? (
          <StatusCard
            icon={<Clock className="w-16 h-16 text-yellow-400" />}
            title="KYC Under Review"
            subtitle="Your documents have been received and are being reviewed by our team. This usually takes 1–3 business days."
            badge="Under Review"
            badgeColor="yellow"
          >
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all border border-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Checking…" : "Refresh Status"}
            </button>
          </StatusCard>
        ) : kycStatus === "SUSPENDED" ? (
          <StatusCard
            icon={<AlertCircle className="w-16 h-16 text-red-400" />}
            title="Account Suspended"
            subtitle="Your KYC verification has been suspended. Please contact our support team for assistance."
            badge="Suspended"
            badgeColor="red"
          />
        ) : (
          // Fallback for unknown states
          <StatusCard
            icon={<XCircle className="w-16 h-16 text-gray-400" />}
            title="Verification Required"
            subtitle="Please contact support if you believe this is an error."
            badge={kycStatus}
            badgeColor="gray"
          />
        )}

        {/* Logout always available */}
        <button
          onClick={handleLogout}
          className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-transparent hover:bg-white/5 text-white/60 hover:text-white font-medium text-sm transition-all border border-white/10"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── Reusable status card ─────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, string> = {
  yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  red:    "bg-red-500/20 text-red-300 border-red-500/30",
  gray:   "bg-white/10 text-white/60 border-white/20",
};

function StatusCard({
  icon, title, subtitle, badge, badgeColor = "gray", children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center space-y-4"
    >
      <div className="flex justify-center">{icon}</div>
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${BADGE_COLORS[badgeColor] ?? BADGE_COLORS.gray}`}>
        {badge.replace(/_/g, " ")}
      </span>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="text-blue-100 text-sm leading-relaxed">{subtitle}</p>
      {children && <div className="pt-2">{children}</div>}
    </motion.div>
  );
}

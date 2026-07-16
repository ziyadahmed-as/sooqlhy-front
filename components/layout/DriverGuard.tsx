"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck, Clock, XCircle, AlertTriangle, Loader2,
  FileText, RefreshCw, ArrowRight, Truck,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getDriverKycStatus, type DriverKycStatus } from "@/lib/api/driver";

// ─── KYC Status Screens ───────────────────────────────────────────────────────

function PendingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-amber-200 dark:border-amber-800/40 shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Verification Under Review</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          Your identity documents are being reviewed. This typically takes 1–2 business days.
          You'll receive a notification once approved.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 text-left mb-6 space-y-2">
          {["Our team reviews your submitted documents", "You'll get a notification once approved", "Full dashboard access unlocks on approval"].map((t) => (
            <div key={t} className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />{t}
            </div>
          ))}
        </div>
        <Link href="/auth/kyc" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-800 transition-colors">
          <FileText className="w-4 h-4" />View KYC Status<ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function RejectedScreen({ reason }: { reason?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-800/40 shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Verification Rejected</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
          Your documents were not accepted. Please review the reason below and resubmit.
        </p>
        {reason && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-xl p-4 text-left mb-6">
            <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1.5">Rejection Reason</p>
            <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">{reason}</p>
          </div>
        )}
        <Link href="/auth/kyc" className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold hover:opacity-90 transition-opacity">
          <RefreshCw className="w-4 h-4" />Resubmit Documents
        </Link>
      </div>
    </div>
  );
}

function NotSubmittedScreen() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-5">
          <Truck className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">KYC Verification Required</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          To start accepting deliveries, you need to complete identity verification first.
          This helps us ensure a safe experience for everyone.
        </p>
        <Link href="/auth/kyc" className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
          <FileText className="w-4 h-4" />Start KYC Verification
        </Link>
      </div>
    </div>
  );
}

function SuspendedScreen() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Account Suspended</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          Your driver account has been suspended. Delivery operations are paused. Please contact support.
        </p>
        <a href="mailto:support@sooqly.com" className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold hover:opacity-90 transition-opacity">
          Contact Support
        </a>
      </div>
    </div>
  );
}

function UnauthorizedScreen() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
          <ShieldCheck className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          This area is only accessible to verified drivers.
        </p>
        <button onClick={() => router.replace("/")} className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold hover:opacity-90 transition-opacity">
          Go to Home
        </button>
      </div>
    </div>
  );
}

// ─── Guard ────────────────────────────────────────────────────────────────────

type GuardState = "loading" | "ok" | "unauthenticated" | "wrong_role" | "suspended" | "kyc_not_submitted" | "kyc_pending" | "kyc_rejected";

export const DriverGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, refreshUser } = useAuthStore();
  const router = useRouter();
  const [guardState, setGuardState] = useState<GuardState>("loading");
  const [rejectionReason, setRejectionReason] = useState<string | undefined>();

  useEffect(() => {
    async function evaluate() {
      if (!user) {
        setGuardState("unauthenticated");
        router.replace("/auth/login");
        return;
      }
      const role = (user.role ?? "").toUpperCase();
      if (role !== "DRIVER") {
        setGuardState("wrong_role");
        return;
      }
      if (user.is_verified) {
        setGuardState("ok");
        return;
      }
      // Re-fetch in case KYC was just approved
      await refreshUser();
      const fresh = useAuthStore.getState().user;
      if (fresh?.is_verified) {
        setGuardState("ok");
        return;
      }
      // Fetch real KYC status
      try {
        const kyc: DriverKycStatus = await getDriverKycStatus();
        if (kyc.overall_status === "APPROVED") {
          setGuardState("ok");
        } else if (kyc.overall_status === "PENDING") {
          setGuardState("kyc_pending");
        } else if (kyc.overall_status === "REJECTED") {
          const rejected = kyc.records.find((r) => r.status === "REJECTED");
          setRejectionReason(rejected?.rejection_reason);
          setGuardState("kyc_rejected");
        } else {
          setGuardState("kyc_not_submitted");
        }
      } catch {
        setGuardState("kyc_not_submitted");
      }
    }
    evaluate();
  }, [user, router, refreshUser]);

  if (guardState === "loading") return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );
  if (guardState === "unauthenticated" || guardState === "wrong_role") return <UnauthorizedScreen />;
  if (guardState === "suspended") return <SuspendedScreen />;
  if (guardState === "kyc_not_submitted") return <NotSubmittedScreen />;
  if (guardState === "kyc_pending") return <PendingScreen />;
  if (guardState === "kyc_rejected") return <RejectedScreen reason={rejectionReason} />;
  return <>{children}</>;
};

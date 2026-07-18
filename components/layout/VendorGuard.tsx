"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck, Clock, XCircle, AlertTriangle, Loader2,
  FileText, RefreshCw, ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { fetchMyKycStatus, type VendorKycStatus } from "@/lib/api/vendor";
import { useIsMounted } from "@/hooks/use-is-mounted";

// ─── KYC Status Screens ───────────────────────────────────────────────────────

function PendingKycScreen() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-amber-200 shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">KYC Under Review</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Your identity verification documents have been submitted and are currently
          being reviewed by our team. This typically takes 1–2 business days.
        </p>
        <div className="bg-amber-50 rounded-xl p-4 text-left mb-6">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
            What happens next?
          </p>
          <ul className="space-y-1.5 text-sm text-amber-800">
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              Our team reviews your submitted documents
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              You'll receive an email once approved
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              Full dashboard access unlocks on approval
            </li>
          </ul>
        </div>
        <Link
          href="/auth/kyc"
          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-800 transition-colors"
        >
          <FileText className="w-4 h-4" />
          View KYC Status
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function RejectedKycScreen({ reason }: { reason?: string }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">KYC Verification Rejected</h2>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          Unfortunately, your verification documents were not accepted. Please review
          the reason below and resubmit corrected documents.
        </p>
        {reason && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-left mb-6">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1.5">
              Rejection Reason
            </p>
            <p className="text-sm text-red-800 leading-relaxed">{reason}</p>
          </div>
        )}
        <Link
          href="/auth/kyc"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-navy text-white text-sm font-bold hover:bg-trust transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Resubmit Documents
        </Link>
      </div>
    </div>
  );
}

function NotSubmittedScreen() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-blue-200 shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">KYC Verification Required</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          To access the Vendor Dashboard and start listing products, you need to
          complete identity verification first.
        </p>
        <Link
          href="/auth/kyc"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-navy text-white text-sm font-bold hover:bg-trust transition-colors"
        >
          <FileText className="w-4 h-4" />
          Start KYC Verification
        </Link>
      </div>
    </div>
  );
}

function SuspendedScreen() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Account Suspended</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Your vendor account has been suspended. Please contact support for assistance.
        </p>
        <a
          href="mailto:support@sooqly.com"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-navy text-white text-sm font-bold hover:bg-trust transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}

function UnauthorizedScreen() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
          <ShieldCheck className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          This area is only accessible to verified vendors.
        </p>
        <button
          onClick={() => router.replace("/")}
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-navy text-white text-sm font-bold hover:bg-trust transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

// ─── Main Guard Component ─────────────────────────────────────────────────────

type GuardState =
  | "loading"
  | "ok"
  | "unauthenticated"
  | "wrong_role"
  | "suspended"
  | "kyc_not_submitted"
  | "kyc_pending"
  | "kyc_rejected";

interface VendorGuardProps {
  children: React.ReactNode;
}

export const VendorGuard: React.FC<VendorGuardProps> = ({ children }) => {
  const { user, refreshUser } = useAuthStore();
  const router = useRouter();
  const [guardState, setGuardState] = useState<GuardState>("loading");
  const [rejectionReason, setRejectionReason] = useState<string | undefined>();

  const isMounted = useIsMounted();

  useEffect(() => {
    async function evaluate() {
      if (!isMounted) return;

      // 1. Not logged in at all
      if (!user) {
        setGuardState("unauthenticated");
        router.replace("/auth/login");
        return;
      }

      const role = (user.role ?? "").toUpperCase();

      // 2. Wrong role entirely
      if (role !== "VENDOR") {
        setGuardState("wrong_role");
        return;
      }

      // 3. Already verified — fast path
      if (user.is_verified) {
        setGuardState("ok");
        return;
      }

      // 4. Not verified — re-fetch user to get the latest is_verified from server
      //    (in case KYC was approved after the last login)
      await refreshUser();
      // After refresh, re-read from store
      const freshUser = useAuthStore.getState().user;
      if (freshUser?.is_verified) {
        setGuardState("ok");
        return;
      }

      // 5. Still not verified — fetch real KYC status from backend
      const kyc: VendorKycStatus = await fetchMyKycStatus();

      switch (kyc.status) {
        case "APPROVED":
          setGuardState("ok");
          break;
        case "PENDING":
        case "UNDER_REVIEW":
          setGuardState("kyc_pending");
          break;
        case "REJECTED":
          setRejectionReason(kyc.rejection_reason);
          setGuardState("kyc_rejected");
          break;
        case "NOT_SUBMITTED":
        default:
          setGuardState("kyc_not_submitted");
          break;
      }
    }

    evaluate();
  }, [user, router, refreshUser, isMounted]);

  // ── Render based on state ──────────────────────────────────────────────────

  if (guardState === "loading") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  if (guardState === "unauthenticated" || guardState === "wrong_role") {
    return <UnauthorizedScreen />;
  }

  if (guardState === "suspended") {
    return <SuspendedScreen />;
  }

  if (guardState === "kyc_not_submitted") {
    return <NotSubmittedScreen />;
  }

  if (guardState === "kyc_pending") {
    return <PendingKycScreen />;
  }

  if (guardState === "kyc_rejected") {
    return <RejectedKycScreen reason={rejectionReason} />;
  }

  // guardState === "ok"
  return <>{children}</>;
};

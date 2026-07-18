"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useIsMounted } from "@/hooks/use-is-mounted";

type GuardState = "loading" | "ok" | "unauthenticated" | "wrong_role" | "suspended";

export const ModeratorGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [state, setState] = useState<GuardState>("loading");
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!isMounted) return;

    if (!user) {
      setState("unauthenticated");
      router.replace("/auth/login");
      return;
    }
    const role = (user.role ?? "").toUpperCase();
    if (!["MODERATOR", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      setState("wrong_role");
      return;
    }
    if (user.is_active === false) {
      setState("suspended");
      return;
    }
    setState("ok");
  }, [user, router, isMounted]);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (state === "suspended") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Account Suspended</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Your moderator account has been suspended. Please contact an administrator.
          </p>
          <a href="mailto:admin@sooqly.com" className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold hover:opacity-90 transition-opacity">
            Contact Admin
          </a>
        </div>
      </div>
    );
  }

  if (state === "wrong_role" || state === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            This area requires a Moderator account.
          </p>
          <button onClick={() => router.replace("/")} className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

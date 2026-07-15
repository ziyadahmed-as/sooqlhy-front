"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

/**
 * /auth/login — Opens the auth modal on the home page.
 * If user is already logged in, redirects to their dashboard.
 */
export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { openAuthModal } = useUIStore();

  useEffect(() => {
    if (user) {
      const roleMap: Record<string, string> = {
        buyer: "/buyer/catalog",
        vendor: "/vendor/dashboard",
        driver: "/driver/dashboard",
        moderator: "/moderator/kyc-review",
        admin: "/admin/dashboard",
      };
      router.replace(roleMap[user.role?.toLowerCase() ?? ""] ?? "/");
      return;
    }
    // Navigate to home and open login modal
    router.replace("/");
    // Small delay to let home page mount before opening modal
    const t = setTimeout(() => openAuthModal("login"), 300);
    return () => clearTimeout(t);
  }, [user, router, openAuthModal]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Redirecting…</p>
      </div>
    </div>
  );
}

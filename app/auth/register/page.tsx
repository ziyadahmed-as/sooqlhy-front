"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

/**
 * /auth/register — Opens the register modal on the home page.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { openAuthModal } = useUIStore();

  useEffect(() => {
    if (user) {
      router.replace("/");
      return;
    }
    router.replace("/");
    const t = setTimeout(() => openAuthModal("register"), 300);
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

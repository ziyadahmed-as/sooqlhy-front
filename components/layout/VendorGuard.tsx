"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Guard that allows only KYC‑verified vendors.
 * Place any vendor page inside <VendorGuard>...</VendorGuard>.
 */
export const VendorGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.is_verified || user.role !== 'vendor') {
      router.replace('/kyc-status');
    }
  }, [user, router]);

  // while redirecting, render nothing
  if (!user?.is_verified || user.role !== 'vendor') return null;
  return <>{children}</>;
};

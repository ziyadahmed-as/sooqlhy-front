"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Guard that allows only KYC‑verified vendors.
 * If the user is not verified, they are redirected to /kyc-status.
 * The guard does **not** redirect when already on the KYC page to avoid a loop.
 */
export const VendorGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Roles that require KYC verification before accessing vendor sections
  const KYC_ROLES = ['VENDOR', 'DRIVER'];

  useEffect(() => {
    const onKycPage = pathname?.startsWith('/kyc-status');
    const needsKyc = user && KYC_ROLES.includes(user.role) && !user.is_verified;
    if (needsKyc && !onKycPage) {
      router.replace('/kyc-status');
    }
  }, [user, router, pathname]);

  // While redirecting or if the user is not a verified vendor, render nothing
  if (user && KYC_ROLES.includes(user.role) && !user.is_verified) {
    return null;
  }
  return <>{children}</>;
};

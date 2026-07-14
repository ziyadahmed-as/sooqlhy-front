"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Guard that allows only KYC-verified vendors.
 * Handles both uppercase (API) and lowercase (JWT middleware) role values.
 */
export const VendorGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Roles that require KYC verification (compare case-insensitively)
  const KYC_ROLES = ['vendor', 'driver'];

  useEffect(() => {
    if (!user) return;
    const role = user.role?.toLowerCase();
    const onKycPage = pathname?.startsWith('/auth/kyc');
    const needsKyc = KYC_ROLES.includes(role) && !user.is_verified;
    if (needsKyc && !onKycPage) {
      router.replace('/auth/kyc');
    }
  }, [user, router, pathname]);

  if (!user) return null;

  const role = user.role?.toLowerCase();
  if (KYC_ROLES.includes(role) && !user.is_verified) {
    return null;
  }

  return <>{children}</>;
};

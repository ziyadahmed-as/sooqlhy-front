"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Drivers use the same shared KYC flow as vendors — redirect to /auth/kyc
export default function DriverKycPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/auth/kyc"); }, [router]);
  return null;
}

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function ModeratorRoot() {
  const router = useRouter();
  useEffect(() => { router.replace("/moderator/dashboard"); }, [router]);
  return null;
}

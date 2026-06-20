// app/auth/login/page.tsx
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from '@/lib/api/axios';
import { motion } from "framer-motion";
import Link from "next/link";
import Head from "next/head";
import brand from '@/app/styles/brand.module.css'; // brand colors

interface LoginFormValues {
  email: string;
  password: string;
}

const schema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type Schema = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Schema>({ resolver: zodResolver(schema) });

  const { login, accessToken, error, loading, user, setUser } = useAuthStore();

  const onSubmit = async (data: LoginFormValues) => {
    console.log('🚀 Submitting login with', data.email);
    await login(data.email, data.password);
    // Ensure user object is populated – some back‑ends return only tokens
    const { setUser } = useAuthStore.getState();
    const response = await api.get('/api/users/auth/me/');
    setUser(response.data);
    // The effect below will handle redirection
  };

  // Removed redundant fetchUser effect; login response already provides user data

  // Redirect after user data is available
  // Debug: log user object on each change
  useEffect(() => {
    console.log('🔎 Auth Store user changed:', user);
    if (!user) return;
    if (!user.is_verified) {
      console.log('⏩ Redirecting to KYC because user not verified');
      router.push("/auth/kyc");
      return;
    }
    const role = user.role as string;
    console.log('✅ User verified, role =', role);
    switch (role) {
      case "BUYER":
        router.push("/buyer/catalog");
        break;
      case "VENDOR":
        router.push("/vendor/dashboard");
        break;
      case "DRIVER":
        router.push("/driver/deliveries");
        break;
      case "MODERATOR":
        router.push("/moderator/kyc-review");
        break;
      case "ADMIN":
        router.push("/admin/dashboard");
        break;
      default:
        router.push("/");
    }
  }, [user, router]);

  return (
    <>
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.dataset.scrollBehavior = 'smooth'",
          }}
        />
      </Head>
      <div className={`flex min-h-screen ${brand["bg-brand-secondary"]} font-sans`}>
        {/* Left side: Premium Image/Branding */}
        <div className={`hidden lg:flex w-1/2 ${brand["bg-brand-primary"]} flex-col justify-center items-center relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20">
            {/* Abstract pattern or premium gradient */}
            <div className={`absolute top-0 left-0 w-96 h-96 ${brand["accent"]} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob`}></div>
            <div className={`absolute top-0 right-0 w-96 h-96 ${brand["bg-brand-primary"]} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000`}></div>
            <div className={`absolute -bottom-8 left-20 w-96 h-96 ${brand["bg-brand-primary"]} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000`}></div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center text-white px-12"
          >
            <h1 className="text-5xl font-bold mb-6 tracking-tight">Welcome to Sooqly</h1>
            <p className="text-xl text-gray-300 max-w-md mx-auto leading-relaxed">
              The next-generation multi-vendor e-commerce platform designed for premium shopping experiences.
            </p>
          </motion.div>
        </div>

        {/* Right side: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-10">
              <h2 className={`text-3xl font-bold ${brand["text-brand-primary"]} mb-2`}>Sign in to your account</h2>
              <p className="text-gray-500">Enter your email and password to access the platform</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#0B1F3A]">Email address</label>
                <Input type="email" placeholder="you@example.com" className={brand["bg-brand-secondary"]} {...register("email")} />
                {errors.email && (
                  <p className={`${brand["text-brand-error"]} text-sm mt-1`}>{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className={`text-sm font-medium ${brand["text-brand-primary"]}`}>Password</label>
                  <Link href="/auth/forgot-password" className={`text-sm ${brand["text-brand-primary"]} hover:${brand["text-brand-primary"]} transition-colors font-medium`}>Forgot password?</Link>
                </div>
                <Input type="password" placeholder="••••••••" className={brand["bg-brand-secondary"]} {...register("password")} />
                {errors.password && (
                  <p className={`text-sm ${brand["text-brand-error"]} mt-1`}>{errors.password.message}</p>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 bg-[#e05a2b]/10 border border-[#e05a2b]/20 rounded-xl text-sm text-[#e05a2b] flex items-center"
                >
                  <span className="mr-2">⚠️</span> {error}
                </motion.div>
              )}

              <Button type="submit" variant="primary" disabled={loading} className={`${brand["bg-brand-primary"]} w-full h-12 text-lg`}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{' '}
                <Link href="/auth/register" className="font-semibold text-[#1a5fa8] hover:text-[#0B1F3A] transition-colors">Sign up</Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}

"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import PageWrapper from "../../components/PageWrapper";

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const schema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

type Schema = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<Schema>({ resolver: zodResolver(schema) });
  const { register: registerUser, loading, error } = useAuthStore(); // assume store has register method

  const onSubmit = async (data: RegisterFormValues) => {
    await registerUser({ email: data.email, password: data.password });
    router.push("/auth/login");
  };

  return (
    <PageWrapper title="Create your account" description="Join Sooqly and start buying or selling today.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#0B1F3A]">Email address</label>
          <Input type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && (<p className="text-sm text-[#e05a2b] mt-1">{errors.email.message}</p>)}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#0B1F3A]">Password</label>
          <Input type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && (<p className="text-sm text-[#e05a2b] mt-1">{errors.password.message}</p>)}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#0B1F3A]">Confirm Password</label>
          <Input type="password" placeholder="••••••••" {...register("confirmPassword")} />
          {errors.confirmPassword && (<p className="text-sm text-[#e05a2b] mt-1">{errors.confirmPassword.message}</p>)}
        </div>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-[#e05a2b]/10 border border-[#e05a2b]/20 rounded-xl text-sm text-[#e05a2b]">
            {error}
          </motion.div>
        )}
        <Button type="submit" variant="primary" disabled={loading} className="w-full h-12 text-lg">
          {loading ? "Creating…" : "Create account"}
        </Button>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-[#1a5fa8] hover:text-[#0B1F3A] transition-colors">Sign in</Link>
        </p>
      </form>
    </PageWrapper>
  );
}

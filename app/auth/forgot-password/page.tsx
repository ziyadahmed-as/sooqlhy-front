"use client"
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "@/lib/api/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ForgotFormValues { email: string }

const schema = z.object({
  email: z.string().email({ message: "Invalid email" })
});

type Schema = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<Schema>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const onSubmit = async (data: ForgotFormValues) => {
    setLoading(true);
    try {
      await axios.post("/api/users/password-reset/", { email: data.email });
      setSuccess(true);
      // optionally redirect after a delay
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex min-h-screen items-center justify-center bg-gray-50 p-4")}>
      <form onSubmit={handleSubmit(onSubmit)} className={cn("w-full max-w-sm space-y-4 rounded bg-white p-6 shadow-md")}>
        <h1 className={cn("text-2xl font-semibold text-center")}>Forgot Password</h1>
        {success ? (
          <p className={cn("text-center text-green-600")}>Password reset email sent. Check your inbox.</p>
        ) : (
          <>
            <Input
              type="email"
              placeholder="Email"
              {...register("email")}
              className={cn("")}
            />
            {errors.email && (
              <p className={cn("text-sm text-red-600")}>{errors.email.message}</p>
            )}
            <Button type="submit" variant="primary" disabled={loading} className={cn("w-full")}>
              {loading ? "Sending…" : "Send Reset Link"}
            </Button>
          </>
        )}
      </form>
    </div>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore, type AuthModalMode } from "@/stores/ui-store";
import { useRouter } from "next/navigation";
import api from "@/lib/api/axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Schemas ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

const forgotSchema = z.object({
  email: z.string().email("Invalid email"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type ForgotData = z.infer<typeof forgotSchema>;

// ─── Password field helper ───────────────────────────────────────────────────

function PasswordField({
  label,
  id,
  registration,
  error,
}: {
  label: string;
  id: string;
  registration: React.InputHTMLAttributes<HTMLInputElement>;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          {...registration}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Login Form ──────────────────────────────────────────────────────────────

function LoginForm({ onSwitch }: { onSwitch: (m: AuthModalMode) => void }) {
  const { login, loading, error } = useAuthStore();
  const { closeAuthModal } = useUIStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginData) => {
    await login(data.email, data.password);
    const { user } = useAuthStore.getState();
    if (user) {
      toast.success(`Welcome back, ${user.name || user.email}!`);
      closeAuthModal();
      const role = user.role?.toLowerCase();
      const redirects: Record<string, string> = {
        buyer: "/buyer/catalog",
        vendor: "/vendor/dashboard",
        driver: "/driver/dashboard",
        moderator: "/moderator/kyc-review",
        admin: "/admin/dashboard",
      };
      if (redirects[role]) router.push(redirects[role]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          {...register("email")}
          autoComplete="email"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-describedby={errors.email ? "login-email-error" : undefined}
        />
        {errors.email && (
          <p id="login-email-error" className="mt-1 text-xs text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <PasswordField
        label="Password"
        id="login-password"
        registration={register("password")}
        error={errors.password?.message}
      />

      <button
        type="button"
        onClick={() => onSwitch("forgot")}
        className="text-xs text-blue-600 hover:underline"
      >
        Forgot password?
      </button>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF4747] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Signing in…" : "Sign In"}
      </button>

      <p className="text-center text-sm text-gray-500">
        No account?{" "}
        <button
          type="button"
          onClick={() => onSwitch("register")}
          className="font-semibold text-[#FF4747] hover:underline"
        >
          Register
        </button>
      </p>
    </form>
  );
}

// ─── Register Form ───────────────────────────────────────────────────────────

function RegisterForm({ onSwitch }: { onSwitch: (m: AuthModalMode) => void }) {
  const { register: registerUser, loading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser({ email: data.email, password: data.password });
      toast.success("Account created! Please sign in.");
      onSwitch("login");
    } catch {
      // error handled in store
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          {...register("email")}
          autoComplete="email"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <PasswordField
        label="Password"
        id="reg-password"
        registration={register("password")}
        error={errors.password?.message}
      />

      <PasswordField
        label="Confirm Password"
        id="reg-confirm"
        registration={register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF4747] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Creating account…" : "Create Account"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitch("login")}
          className="font-semibold text-[#FF4747] hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

// ─── Forgot Password Form ────────────────────────────────────────────────────

function ForgotForm({ onSwitch }: { onSwitch: (m: AuthModalMode) => void }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotData>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (data: ForgotData) => {
    setLoading(true);
    try {
      await api.post("/api/users/password-reset/", { email: data.email });
      setSent(true);
    } catch {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-4 space-y-3">
        <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
        <p className="text-sm text-gray-700">Reset link sent — check your inbox.</p>
        <button
          onClick={() => onSwitch("login")}
          className="text-sm font-semibold text-[#FF4747] hover:underline"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="text-sm text-gray-500">Enter your email and we'll send a reset link.</p>
      <div>
        <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          {...register("email")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF4747] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Sending…" : "Send Reset Link"}
      </button>

      <p className="text-center text-sm">
        <button
          type="button"
          onClick={() => onSwitch("login")}
          className="text-[#FF4747] hover:underline font-medium"
        >
          ← Back to sign in
        </button>
      </p>
    </form>
  );
}

// ─── Modal Shell ─────────────────────────────────────────────────────────────

const titles: Record<NonNullable<AuthModalMode>, string> = {
  login: "Sign In",
  register: "Create Account",
  forgot: "Reset Password",
};

export default function AuthModal() {
  const { authModal, closeAuthModal, openAuthModal } = useUIStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeAuthModal]);

  // Trap scroll
  useEffect(() => {
    if (authModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [authModal]);

  if (!authModal) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={titles[authModal]}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) closeAuthModal();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{titles[authModal]}</h2>
          <button
            onClick={closeAuthModal}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {authModal === "login" && <LoginForm onSwitch={openAuthModal} />}
          {authModal === "register" && <RegisterForm onSwitch={openAuthModal} />}
          {authModal === "forgot" && <ForgotForm onSwitch={openAuthModal} />}
        </div>
      </div>
    </div>
  );
}

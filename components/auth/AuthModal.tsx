"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Eye, EyeOff, Loader2, CheckCircle, User, Store, Truck } from "lucide-react";
import { useAuthStore, type RegisterPayload } from "@/stores/auth-store";
import { useUIStore, type AuthModalMode } from "@/stores/ui-store";
import { useRouter } from "next/navigation";
import api from "@/lib/api/axios";
import { toast } from "sonner";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
});

const registerSchema = z
  .object({
    role: z.enum(["BUYER", "VENDOR", "DRIVER"]),
    first_name: z.string().min(1, "Required"),
    last_name: z.string().min(1, "Required"),
    username: z.string().min(3, "At least 3 characters"),
    email: z.string().email("Invalid email"),
    phone_number: z.string().optional(),
    password: z.string().min(6, "At least 6 characters"),
    confirmPassword: z.string(),
    store_name: z.string().optional(),
    license_number: z.string().optional(),
    vehicle_type: z.string().optional(),
    // Delivery address (buyer only)
    street_address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const forgotSchema = z.object({ email: z.string().email("Invalid email") });

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type ForgotData = z.infer<typeof forgotSchema>;

// ─── Helper: password input with show/hide toggle ─────────────────────────────
function PwdInput({
  id, label, error, ...rest
}: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
          {...rest}
        />
        <button type="button" onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function TxtInput({
  id, label, error, ...rest
}: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input id={id}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SubmitBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-trust disabled:opacity-60 transition-colors"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }: { onSwitch: (m: AuthModalMode) => void }) {
  const { login, loading, error } = useAuthStore();
  const { closeAuthModal } = useUIStore();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginData) => {
    await login(data.email, data.password);
    const { user } = useAuthStore.getState();
    if (!user) return;
    toast.success(`Welcome back, ${user.name || user.email}!`);
    closeAuthModal();
    const map: Record<string, string> = {
      buyer: "/buyer/catalog", vendor: "/vendor/dashboard",
      driver: "/driver/dashboard", moderator: "/moderator/dashboard", admin: "/admin/dashboard", super_admin: "/super_admin/dashboard",
    };
    const dest = map[user.role?.toLowerCase() ?? ""];
    if (dest) router.push(dest);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <TxtInput id="login-email" label="Email address" type="email" autoComplete="email"
        placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
      <PwdInput id="login-password" label="Password" autoComplete="current-password"
        error={errors.password?.message} {...register("password")} />
      <div className="flex justify-end">
        <button type="button" onClick={() => onSwitch("forgot")} className="text-xs text-trust hover:underline">
          Forgot password?
        </button>
      </div>
      {error && <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</p>}
      <SubmitBtn loading={loading}>{loading ? "Signing in…" : "Sign In"}</SubmitBtn>
      <p className="text-center text-sm text-gray-500">
        No account?{" "}
        <button type="button" onClick={() => onSwitch("register")} className="font-semibold text-navy hover:underline">
          Register free
        </button>
      </p>
    </form>
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────
const VEHICLE_TYPES = ["MOTORCYCLE", "CAR", "VAN", "TRUCK", "BICYCLE"];

function RegisterForm({ onSwitch }: { onSwitch: (m: AuthModalMode) => void }) {
  const { register: storeRegister, loading, error } = useAuthStore();
  const { closeAuthModal } = useUIStore();
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "BUYER" },
  });
  const role = watch("role");

  const onSubmit = async (data: RegisterData) => {
    const payload: RegisterPayload = {
      email: data.email,
      username: data.username,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role,
      phone_number: data.phone_number || undefined,
      store_name: data.role === "VENDOR" ? data.store_name : undefined,
      license_number: data.role === "DRIVER" ? data.license_number : undefined,
      vehicle_type: data.role === "DRIVER" ? (data.vehicle_type || "MOTORCYCLE") : undefined,
    };
    try {
      await storeRegister(payload);
      const { user } = useAuthStore.getState();
      if (user) {
        // Save delivery address for buyers if provided
        if (data.role === "BUYER" && data.street_address && data.city && data.country) {
          try {
            await api.post("/api/users/addresses/", {
              street_address: data.street_address,
              city: data.city,
              state: data.state || data.city,
              country: data.country,
              postal_code: data.postal_code || "",
              address_type: "HOME",
              is_default: true,
            });
          } catch { /* address save is non-fatal */ }
        }
        toast.success("Account created! Welcome to Sooqly.");
        closeAuthModal();
        const map: Record<string, string> = {
          buyer: "/buyer/catalog", vendor: "/vendor/dashboard", driver: "/driver/dashboard",
        };
        router.push(map[user.role?.toLowerCase() ?? ""] ?? "/");
      } else {
        toast.success("Account created! Please sign in.");
        onSwitch("login");
      }
    } catch { /* error shown from store */ }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-h-[62vh] overflow-y-auto pr-1" noValidate>
      {/* Role picker */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">I want to join as</p>
        <div className="grid grid-cols-3 gap-2">
          {([["BUYER", <User key="u" className="w-4 h-4" />, "Buyer"],
            ["VENDOR", <Store key="s" className="w-4 h-4" />, "Vendor"],
            ["DRIVER", <Truck key="t" className="w-4 h-4" />, "Driver"]] as const).map(([val, icon, lbl]) => (
            <label key={val}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border-2 cursor-pointer transition-colors text-xs font-semibold ${role === val ? "border-navy bg-navy/5 text-navy" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              <input type="radio" value={val} {...register("role")} className="sr-only" />
              {icon}{lbl}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TxtInput id="r-first" label="First Name" placeholder="John" error={errors.first_name?.message} {...register("first_name")} />
        <TxtInput id="r-last" label="Last Name" placeholder="Doe" error={errors.last_name?.message} {...register("last_name")} />
      </div>
      <TxtInput id="r-user" label="Username" placeholder="johndoe" autoComplete="username"
        error={errors.username?.message} {...register("username")} />
      <TxtInput id="r-email" label="Email" type="email" placeholder="you@example.com"
        autoComplete="email" error={errors.email?.message} {...register("email")} />
      <TxtInput id="r-phone" label="Phone (optional)" type="tel" placeholder="+1 555 000 0000"
        error={errors.phone_number?.message} {...register("phone_number")} />

      {role === "VENDOR" && (
        <TxtInput id="r-store" label="Store Name" placeholder="My Awesome Store"
          error={errors.store_name?.message} {...register("store_name")} />
      )}
      {role === "DRIVER" && (
        <>
          <TxtInput id="r-license" label="License Number" placeholder="DL-1234567"
            error={errors.license_number?.message} {...register("license_number")} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
            <select {...register("vehicle_type")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-navy focus:outline-none">
              {VEHICLE_TYPES.map((v) => <option key={v} value={v}>{v.charAt(0) + v.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
        </>
      )}
      {role === "BUYER" && (
        <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Address (optional)</p>
          <TxtInput id="r-street" label="Street Address" placeholder="123 Main St"
            error={errors.street_address?.message} {...register("street_address")} />
          <div className="grid grid-cols-2 gap-2">
            <TxtInput id="r-city" label="City" placeholder="Addis Ababa"
              error={errors.city?.message} {...register("city")} />
            <TxtInput id="r-state" label="Region/State" placeholder="Addis Ababa"
              error={errors.state?.message} {...register("state")} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TxtInput id="r-country" label="Country" placeholder="Ethiopia"
              error={errors.country?.message} {...register("country")} />
            <TxtInput id="r-postal" label="Postal Code (opt.)" placeholder="1000"
              error={errors.postal_code?.message} {...register("postal_code")} />
          </div>
        </div>
      )}

      <PwdInput id="r-pwd" label="Password" autoComplete="new-password"
        error={errors.password?.message} {...register("password")} />
      <PwdInput id="r-confirm" label="Confirm Password" autoComplete="new-password"
        error={errors.confirmPassword?.message} {...register("confirmPassword")} />

      {error && <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 break-words">{error}</p>}
      <SubmitBtn loading={loading}>{loading ? "Creating account…" : "Create Account"}</SubmitBtn>
      <p className="text-center text-sm text-gray-500 pb-1">
        Already registered?{" "}
        <button type="button" onClick={() => onSwitch("login")} className="font-semibold text-navy hover:underline">Sign in</button>
      </p>
    </form>
  );
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
function ForgotForm({ onSwitch }: { onSwitch: (m: AuthModalMode) => void }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotData>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (data: ForgotData) => {
    setLoading(true);
    try {
      await api.post("/api/users/auth/password-reset/", { email: data.email });
      setSent(true);
    } catch { toast.error("Failed to send reset email. Please try again."); }
    finally { setLoading(false); }
  };

  if (sent) {
    return (
      <div className="text-center py-6 space-y-4">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <p className="text-sm text-gray-700 font-medium">Reset link sent — check your inbox.</p>
        <button onClick={() => onSwitch("login")} className="text-sm font-semibold text-navy hover:underline">← Back to sign in</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="text-sm text-gray-500">Enter your email and we'll send you a password reset link.</p>
      <TxtInput id="forgot-email" label="Email address" type="email" placeholder="you@example.com"
        autoComplete="email" error={errors.email?.message} {...register("email")} />
      <SubmitBtn loading={loading}>{loading ? "Sending…" : "Send Reset Link"}</SubmitBtn>
      <p className="text-center">
        <button type="button" onClick={() => onSwitch("login")} className="text-sm text-navy font-medium hover:underline">← Back to sign in</button>
      </p>
    </form>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────
const TITLES: Record<NonNullable<AuthModalMode>, string> = {
  login: "Sign In to Sooqly",
  register: "Create Your Account",
  forgot: "Reset Your Password",
};

export default function AuthModal() {
  const { authModal, closeAuthModal, openAuthModal } = useUIStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") closeAuthModal(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [closeAuthModal]);

  useEffect(() => {
    document.body.style.overflow = authModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [authModal]);

  if (!authModal) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog" aria-modal="true" aria-label={TITLES[authModal]}
      onClick={(e) => { if (e.target === overlayRef.current) closeAuthModal(); }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-base font-bold text-gray-900">{TITLES[authModal]}</h2>
            {authModal === "register" && (
              <p className="text-xs text-gray-400 mt-0.5">All fields are required unless marked optional</p>
            )}
          </div>
          <button onClick={closeAuthModal}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">
          {authModal === "login" && <LoginForm onSwitch={openAuthModal} />}
          {authModal === "register" && <RegisterForm onSwitch={openAuthModal} />}
          {authModal === "forgot" && <ForgotForm onSwitch={openAuthModal} />}
        </div>
      </div>
    </div>
  );
}

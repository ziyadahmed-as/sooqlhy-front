// app/auth/register/page.tsx
"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"

const schema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  phoneNumber: z.string().min(1, { message: "Phone number is required" }),
  role: z.enum(["BUYER", "VENDOR", "DRIVER"]),
  storeName: z.string().optional(),
  vehicleType: z.string().optional(),
  licenseNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
})

type Schema = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, loading, error } = useAuthStore()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Schema>({ 
    resolver: zodResolver(schema),
    defaultValues: { role: "BUYER" }
  })

  const selectedRole = watch("role")

  const onSubmit = async (data: Schema) => {
    try {
      await registerUser({
        email: data.email,
        username: data.username,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
        phone_number: data.phoneNumber,
        store_name: data.storeName,
        vehicle_type: data.vehicleType,
        license_number: data.licenseNumber,
      })
      router.push("/auth/login?registered=1")
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f8f6f2] font-sans">
      {/* Left side: Premium Image/Branding */}
      <div className="hidden lg:flex w-[40%] bg-[#0B1F3A] flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#f4a92a] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#e05a2b] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-12"
        >
          <h1 className="text-5xl font-bold mb-6 tracking-tight">Join Sooqly</h1>
          <p className="text-xl text-gray-300 max-w-sm mx-auto leading-relaxed">
            Create your account and unlock a premium multi-vendor shopping and selling experience.
          </p>
        </motion.div>
      </div>

      {/* Right side: Registration Form */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-8 sm:p-12 overflow-y-auto max-h-screen">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#0B1F3A] mb-2">Create an account</h2>
            <p className="text-gray-500">Fill in the details below to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="flex flex-wrap gap-4 mb-6">
              {["BUYER", "VENDOR", "DRIVER"].map((role) => (
                <div
                  key={role}
                  onClick={() => setValue("role", role as any)}
                  className={cn(
                    "cursor-pointer rounded-xl border-2 px-6 py-3 font-semibold transition-all flex-1 text-center",
                    selectedRole === role 
                      ? "border-[#1a5fa8] bg-[#1a5fa8]/10 text-[#1a5fa8]" 
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  {role}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#0B1F3A]">First Name</label>
                <Input placeholder="John" {...register("firstName")} />
                {errors.firstName && <p className="text-sm text-[#e05a2b] mt-1">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#0B1F3A]">Last Name</label>
                <Input placeholder="Doe" {...register("lastName")} />
                {errors.lastName && <p className="text-sm text-[#e05a2b] mt-1">{errors.lastName.message}</p>}
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#0B1F3A]">Username</label>
                <Input placeholder="johndoe123" {...register("username")} />
                {errors.username && <p className="text-sm text-[#e05a2b] mt-1">{errors.username.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#0B1F3A]">Email address</label>
                <Input type="email" placeholder="you@example.com" {...register("email")} />
                {errors.email && <p className="text-sm text-[#e05a2b] mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-[#0B1F3A]">Password</label>
                <Input type="password" placeholder="••••••••" {...register("password")} />
                {errors.password && <p className="text-sm text-[#e05a2b] mt-1">{errors.password.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#0B1F3A]">Confirm Password</label>
                <Input type="password" placeholder="••••••••" {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-sm text-[#e05a2b] mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-[#0B1F3A]">Phone Number</label>
                <Input placeholder="+1234567890" {...register("phoneNumber")} />
                {errors.phoneNumber && <p className="text-sm text-[#e05a2b] mt-1">{errors.phoneNumber.message}</p>}
              </div>
            </div>

            {/* Role Specific Fields */}
            {selectedRole === "VENDOR" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1">
                <label className="text-sm font-medium text-[#0B1F3A]">Store Name</label>
                <Input placeholder="My Awesome Store" {...register("storeName")} />
              </motion.div>
            )}

            {selectedRole === "DRIVER" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#0B1F3A]">Vehicle Type</label>
                  <Input placeholder="MOTORCYCLE / CAR" {...register("vehicleType")} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#0B1F3A]">License Number</label>
                  <Input placeholder="XYZ-1234" {...register("licenseNumber")} />
                </div>
              </motion.div>
            )}

            {error && (
              <div className="p-3 bg-[#e05a2b]/10 border border-[#e05a2b]/20 rounded-xl text-sm text-[#e05a2b]">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            <Button type="submit" variant="primary" disabled={loading} className="w-full h-12 text-lg">
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
            
            <p className="text-center text-sm text-gray-500 mt-6 pb-8">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-[#1a5fa8] hover:text-[#0B1F3A] transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

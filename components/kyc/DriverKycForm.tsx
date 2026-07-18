// components/kyc/DriverKycForm.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "@/lib/api/axios";
import { useAuthStore } from "@/stores/auth-store";
import { KycRequirement } from "@/lib/types/kyc";
import MultiStepForm, { Step } from "./MultiStepForm";
import FileDropZone from "./FileDropZone";
import LivePhotoCapture from "./LivePhotoCapture";
import { FormInput, FormSelect, FormTextarea } from "./FormField";
import { Car, MapPin, Banknote, FileCheck2, User2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DriverFormData {
  // Step 1 — Personal & Identity
  first_name: string;
  last_name: string;
  phone_number: string;
  national_id: string;
  license_number: string;
  profile_photo: File | null;
  // Step 2 — Vehicle Info
  vehicle_type: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_color: string;
  plate_number: string;
  insurance_info: string;
  // Step 3 — Delivery Area & Emergency
  preferred_areas: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  // Step 4 — Bank Info
  bank_name: string;
  account_holder: string;
  account_number: string;
  mobile_money: string;
}

const INITIAL: DriverFormData = {
  first_name: "", last_name: "", phone_number: "",
  national_id: "", license_number: "",
  profile_photo: null,
  vehicle_type: "MOTORCYCLE", vehicle_brand: "", vehicle_model: "",
  vehicle_color: "", plate_number: "", insurance_info: "",
  preferred_areas: "",
  emergency_contact_name: "", emergency_contact_phone: "",
  bank_name: "", account_holder: "", account_number: "", mobile_money: "",
};

const STEPS: Step[] = [
  { id: "personal",  title: "Personal & Identity", description: "Your identity and contact details" },
  { id: "vehicle",   title: "Vehicle Information", description: "Your vehicle details and insurance" },
  { id: "area",      title: "Delivery & Contact",  description: "Delivery area and emergency contact" },
  { id: "bank",      title: "Bank Information",    description: "Where should we send your earnings?" },
  { id: "documents", title: "Document Upload",     description: "Upload all required verification documents" },
  { id: "review",    title: "Review & Submit",     description: "Confirm everything before submitting" },
];

const VEHICLE_TYPES = [
  { value: "MOTORCYCLE", label: "Motorcycle" },
  { value: "BICYCLE",    label: "Bicycle" },
  { value: "CAR",        label: "Car" },
  { value: "VAN",        label: "Van" },
  { value: "TRUCK",      label: "Truck" },
];

interface Props {
  requirements: KycRequirement[];
}

export default function DriverKycForm({ requirements }: Props) {
  const router = useRouter();
  const { refreshUser, user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<DriverFormData>(() => ({
    ...INITIAL,
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone_number: user?.phone_number || "",
  }));
  const [docFiles, setDocFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof DriverFormData, string>>>({});

  // ── Pre-fill existing profile data ──────────────────────────────────────────
  useEffect(() => {
    axios.get("/api/users/driver-profile/me/")
      .then((res) => {
        const data = res.data;
        setForm(prev => ({
          ...prev,
          vehicle_type: data.vehicle_type || prev.vehicle_type,
          vehicle_brand: data.vehicle_brand || "",
          vehicle_model: data.vehicle_model || "",
          vehicle_color: data.vehicle_color || "",
          plate_number: data.plate_number || "",
          insurance_info: data.insurance_info || "",
          license_number: data.license_number || "",
          national_id: data.national_id || "",
          preferred_areas: data.preferred_areas || "",
          emergency_contact_name: data.emergency_contact_name || "",
          emergency_contact_phone: data.emergency_contact_phone || "",
        }));
      })
      .catch(() => {}); // ignore errors (e.g. 404 if not found)
  }, []);

  const set = useCallback((field: keyof DriverFormData, value: string | File | null) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (step === 0) {
      if (!form.first_name.trim())    errs.first_name    = "Required";
      if (!form.last_name.trim())     errs.last_name     = "Required";
      if (!form.national_id.trim())   errs.national_id   = "Required";
      if (!form.license_number.trim()) errs.license_number = "Required";
    }
    if (step === 1) {
      if (!form.vehicle_type)          errs.vehicle_type  = "Required";
      if (!form.plate_number.trim())   errs.plate_number  = "Required";
    }
    if (step === 3) {
      if (!form.bank_name.trim())      errs.bank_name      = "Required";
      if (!form.account_holder.trim()) errs.account_holder = "Required";
      if (!form.account_number.trim()) errs.account_number = "Required";
    }
    if (step === 4) {
      requirements.filter(r => r.is_required).forEach(r => {
        if (!docFiles[r.code]) {
          errs[`doc_${r.code}` as keyof DriverFormData] = "Required";
        }
      });
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validate()) setStep(s => s + 1); };
  const handlePrev = () => { setStep(s => s - 1); setErrors({}); };

  // ── Submission ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // 1. Update user basic info
      await axios.patch("/api/users/auth/me/", {
        first_name:   form.first_name,
        last_name:    form.last_name,
        phone_number: form.phone_number || undefined,
      });

      // 2. Update driver profile (multipart for profile_photo)
      const dpForm = new FormData();
      dpForm.append("vehicle_type",            form.vehicle_type);
      dpForm.append("vehicle_brand",           form.vehicle_brand);
      dpForm.append("vehicle_model",           form.vehicle_model);
      dpForm.append("vehicle_color",           form.vehicle_color);
      dpForm.append("plate_number",            form.plate_number);
      dpForm.append("insurance_info",          form.insurance_info);
      dpForm.append("license_number",          form.license_number);
      dpForm.append("national_id",             form.national_id);
      dpForm.append("preferred_areas",         form.preferred_areas);
      dpForm.append("emergency_contact_name",  form.emergency_contact_name);
      dpForm.append("emergency_contact_phone", form.emergency_contact_phone);
      if (form.profile_photo) dpForm.append("profile_photo", form.profile_photo);
      await axios.patch("/api/users/driver-profile/me/", dpForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 3. Submit KYC documents
      const kycForm = new FormData();
      requirements.forEach(r => {
        const file = docFiles[r.code];
        if (file) kycForm.append(`requirement_${r.code}_file`, file);
      });
      await axios.post("/api/kyc/me/submit/", kycForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refreshUser();
      toast.success("KYC submitted successfully! Your application is under review.");
      router.push("/auth/kyc");
    } catch (err: unknown) {
      const detail = (err as any)?.response?.data?.detail || "Submission failed. Please try again.";
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step rendering ──────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // ── Step 0: Personal & Identity
      case 0:
        return (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="First Name" required value={form.first_name} onChange={e => set("first_name", e.target.value)} error={errors.first_name} placeholder="John" />
              <FormInput label="Last Name"  required value={form.last_name}  onChange={e => set("last_name",  e.target.value)} error={errors.last_name}  placeholder="Doe"  />
            </div>
            <FormInput label="Phone Number" type="tel" value={form.phone_number} onChange={e => set("phone_number", e.target.value)} placeholder="+251 91 234 5678" />
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Identity Details</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormInput label="National ID Number" required value={form.national_id}    onChange={e => set("national_id",    e.target.value)} error={errors.national_id}    placeholder="ETH-123456789" />
                <FormInput label="Driver License Number" required value={form.license_number} onChange={e => set("license_number", e.target.value)} error={errors.license_number} placeholder="DL-00123456" />
              </div>
            </div>
            <FileDropZone label="Profile Photo" hint="Optional — clear front-facing photo" file={form.profile_photo} onChange={f => set("profile_photo", f)} accept=".jpg,.jpeg,.png" />
          </div>
        );

      // ── Step 1: Vehicle Information
      case 1:
        return (
          <div className="space-y-5">
            <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 flex items-center gap-2">
              <Car className="w-4 h-4 shrink-0" />
              Provide accurate vehicle details. These will be verified against your documents.
            </div>
            <FormSelect label="Vehicle Type" required value={form.vehicle_type} onChange={e => set("vehicle_type", e.target.value)} error={errors.vehicle_type} options={VEHICLE_TYPES} />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="Vehicle Brand" value={form.vehicle_brand} onChange={e => set("vehicle_brand", e.target.value)} placeholder="Honda" />
              <FormInput label="Vehicle Model" value={form.vehicle_model} onChange={e => set("vehicle_model", e.target.value)} placeholder="CB 150R" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="Vehicle Color"  value={form.vehicle_color} onChange={e => set("vehicle_color",  e.target.value)} placeholder="Red" />
              <FormInput label="Plate Number" required value={form.plate_number} onChange={e => set("plate_number", e.target.value)} error={errors.plate_number} placeholder="AA 3 12345" />
            </div>
            <FormTextarea label="Insurance Information" hint="Optional — policy number, provider name, expiry date" value={form.insurance_info} onChange={e => set("insurance_info", e.target.value)} placeholder="e.g. Awash Insurance, Policy #INS-001, exp 2026-12-31" rows={2} />
          </div>
        );

      // ── Step 2: Delivery Area & Emergency Contact
      case 2:
        return (
          <div className="space-y-5">
            <div className="p-3 bg-green-50 rounded-xl text-xs text-green-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" />
              Let us know where you prefer to deliver so we can match you with nearby orders.
            </div>
            <FormTextarea label="Preferred Delivery Areas" hint="List the areas or sub-cities where you prefer to work, comma-separated" value={form.preferred_areas} onChange={e => set("preferred_areas", e.target.value)} placeholder="Bole, Kazanchis, Piassa, CMC…" rows={3} />
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Emergency Contact</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormInput label="Contact Name"  value={form.emergency_contact_name}  onChange={e => set("emergency_contact_name",  e.target.value)} placeholder="Jane Doe" />
                <FormInput label="Contact Phone" value={form.emergency_contact_phone} onChange={e => set("emergency_contact_phone", e.target.value)} type="tel" placeholder="+251 91 111 1111" />
              </div>
            </div>
          </div>
        );

      // ── Step 3: Bank Information
      case 3:
        return (
          <div className="space-y-5">
            <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-700 flex items-center gap-2">
              <Banknote className="w-4 h-4 shrink-0" />
              Earnings will be transferred to this account. Please verify the details carefully.
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="Bank Name"           required value={form.bank_name}      onChange={e => set("bank_name",      e.target.value)} error={errors.bank_name}      placeholder="Commercial Bank of Ethiopia" />
              <FormInput label="Account Holder Name" required value={form.account_holder} onChange={e => set("account_holder", e.target.value)} error={errors.account_holder} placeholder="John Doe" />
            </div>
            <FormInput label="Account Number" required value={form.account_number} onChange={e => set("account_number", e.target.value)} error={errors.account_number} placeholder="1000123456789" />
            <FormInput label="Mobile Money / Wallet (Optional)" value={form.mobile_money} onChange={e => set("mobile_money", e.target.value)} placeholder="+251 91 234 5678 (Telebirr, M-Pesa…)" />
          </div>
        );

      // ── Step 4: Documents
      case 4:
        return (
          <div className="space-y-5">
            <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 shrink-0" />
              All documents marked with * are required. Live selfies require camera access.
            </div>
            {requirements.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No document requirements found for your account type.</p>
            ) : (
              <div className="space-y-5">
                {requirements.map(r =>
                  r.is_live_photo ? (
                    <LivePhotoCapture
                      key={r.id || r.code}
                      label={r.name}
                      hint={r.description}
                      required={r.is_required}
                      captured={docFiles[r.code] ?? null}
                      onCapture={f => setDocFiles(prev => ({ ...prev, [r.code]: f }))}
                      onRetake={() => setDocFiles(prev => ({ ...prev, [r.code]: null }))}
                    />
                  ) : (
                    <FileDropZone
                      key={r.id || r.code}
                      label={r.name}
                      hint={r.description}
                      required={r.is_required}
                      file={docFiles[r.code] ?? null}
                      onChange={f => setDocFiles(prev => ({ ...prev, [r.code]: f }))}
                    />
                  )
                )}
              </div>
            )}
          </div>
        );

      // ── Step 5: Review
      case 5:
        return (
          <div className="space-y-5">
            <ReviewSection title="Personal & Identity" icon={<User2 className="w-4 h-4" />}>
              <ReviewRow label="Name"           value={`${form.first_name} ${form.last_name}`} />
              <ReviewRow label="Phone"          value={form.phone_number || "—"} />
              <ReviewRow label="National ID"    value={form.national_id} />
              <ReviewRow label="License Number" value={form.license_number} />
            </ReviewSection>

            <ReviewSection title="Vehicle" icon={<Car className="w-4 h-4" />}>
              <ReviewRow label="Type"         value={VEHICLE_TYPES.find(v => v.value === form.vehicle_type)?.label ?? form.vehicle_type} />
              <ReviewRow label="Brand / Model" value={[form.vehicle_brand, form.vehicle_model].filter(Boolean).join(" ") || "—"} />
              <ReviewRow label="Plate Number"  value={form.plate_number} />
              <ReviewRow label="Color"         value={form.vehicle_color || "—"} />
            </ReviewSection>

            <ReviewSection title="Bank Information" icon={<Banknote className="w-4 h-4" />}>
              <ReviewRow label="Bank"           value={form.bank_name} />
              <ReviewRow label="Account Holder" value={form.account_holder} />
              <ReviewRow label="Account Number" value={form.account_number} />
            </ReviewSection>

            <ReviewSection title="Documents" icon={<FileCheck2 className="w-4 h-4" />}>
              {requirements.map(r => (
                <ReviewRow key={r.code} label={r.name} value={docFiles[r.code]?.name ?? (r.is_required ? "⚠ Missing" : "Not uploaded")} />
              ))}
            </ReviewSection>
          </div>
        );
    }
  };

  return (
    <MultiStepForm
      steps={STEPS}
      currentStep={step}
      onNext={handleNext}
      onPrev={handlePrev}
      onSubmit={handleSubmit}
      isSubmitting={submitting}
      isLastStep={step === STEPS.length - 1}
      canProceed={true}
    >
      {renderStep()}
    </MultiStepForm>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function ReviewSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 border-b border-gray-100">
        <span className="text-blue-600">{icon}</span>
        <h3 className="text-sm font-bold text-gray-700">{title}</h3>
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between px-4 py-2.5 gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-right ${value.startsWith("⚠") ? "text-red-500" : "text-gray-800"}`}>{value}</span>
    </div>
  );
}

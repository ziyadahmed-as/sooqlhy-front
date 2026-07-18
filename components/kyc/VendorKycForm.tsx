// components/kyc/VendorKycForm.tsx
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
import { Building2, MapPin, Banknote, FileCheck2, User2, Eye, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VendorFormData {
  // Step 1 — Personal & Store Info
  first_name: string;
  last_name: string;
  phone_number: string;
  store_name: string;
  business_name: string;
  business_type: string;
  category: string;
  store_description: string;
  store_logo: File | null;
  // Step 2 — Business Address
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  // Step 3 — Bank Information (stored as JSON)
  bank_name: string;
  account_holder: string;
  account_number: string;
  branch_name: string;
  mobile_money: string;
}

const INITIAL: VendorFormData = {
  first_name: "", last_name: "", phone_number: "",
  store_name: "", business_name: "", business_type: "", category: "", store_description: "",
  store_logo: null,
  street_address: "", city: "", state: "", postal_code: "", country: "",
  bank_name: "", account_holder: "", account_number: "", branch_name: "", mobile_money: "",
};

const STEPS: Step[] = [
  { id: "personal",  title: "Store & Personal", description: "Tell us about you and your store" },
  { id: "address",   title: "Business Address", description: "Where is your business located?" },
  { id: "bank",      title: "Bank Information", description: "Where should we send your payouts?" },
  { id: "documents", title: "Document Upload",  description: "Upload your required verification documents" },
  { id: "review",    title: "Review & Submit",  description: "Double-check everything before submitting" },
];

const BUSINESS_TYPES = [
  { value: "SOLE_PROPRIETOR", label: "Sole Proprietor" },
  { value: "PARTNERSHIP",     label: "Partnership" },
  { value: "LLC",             label: "LLC" },
  { value: "CORPORATION",     label: "Corporation" },
  { value: "NGO",             label: "NGO / Non-Profit" },
  { value: "OTHER",           label: "Other" },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  requirements: KycRequirement[];
}

export default function VendorKycForm({ requirements }: Props) {
  const router = useRouter();
  const { refreshUser, user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<VendorFormData>(() => ({
    ...INITIAL,
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone_number: user?.phone_number || "",
  }));
  const [docFiles, setDocFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof VendorFormData, string>>>({});

  // ── Pre-fill existing profile data ──────────────────────────────────────────
  useEffect(() => {
    axios.get("/api/users/vendor-profile/me/")
      .then((res) => {
        const data = res.data;
        setForm(prev => ({
          ...prev,
          store_name: data.store_name || "",
          business_name: data.business_name || "",
          business_type: data.business_type || "SOLE_PROPRIETORSHIP",
          category: data.category || "",
          store_description: data.store_description || "",
          street_address: data.address?.street_address || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          postal_code: data.address?.postal_code || "",
          country: data.address?.country || "Ethiopia",
          bank_name: data.bank_account?.bank_name || "",
          account_holder: data.bank_account?.account_holder || "",
          account_number: data.bank_account?.account_number || "",
        }));
      })
      .catch(() => {}); // ignore errors
  }, []);

  const set = useCallback((field: keyof VendorFormData, value: string | File | null) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (step === 0) {
      if (!form.first_name.trim())    errs.first_name    = "Required";
      if (!form.last_name.trim())     errs.last_name     = "Required";
      if (!form.store_name.trim())    errs.store_name    = "Required";
      if (!form.business_name.trim()) errs.business_name = "Required";
      if (!form.business_type)        errs.business_type = "Required";
    }
    if (step === 1) {
      if (!form.street_address.trim()) errs.street_address = "Required";
      if (!form.city.trim())           errs.city           = "Required";
      if (!form.country.trim())        errs.country        = "Required";
    }
    if (step === 2) {
      if (!form.bank_name.trim())      errs.bank_name      = "Required";
      if (!form.account_holder.trim()) errs.account_holder = "Required";
      if (!form.account_number.trim()) errs.account_number = "Required";
    }
    if (step === 3) {
      requirements.filter(r => r.is_required).forEach(r => {
        if (!docFiles[r.code]) {
          errs[`doc_${r.code}` as keyof VendorFormData] = "Required";
        }
      });
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validate()) setStep(s => s + 1); };
  const handlePrev = () => { setStep(s => s - 1); setErrors({}); };

  // ── Submission — calls 3 APIs then KYC submit ───────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // 1. Update user first/last name & phone
      await axios.patch("/api/users/auth/me/", {
        first_name: form.first_name,
        last_name: form.last_name,
        phone_number: form.phone_number || undefined,
      });

      // 2. Update vendor profile (with store logo if provided)
      const vpForm = new FormData();
      vpForm.append("store_name",       form.store_name);
      vpForm.append("business_name",    form.business_name);
      vpForm.append("business_type",    form.business_type);
      vpForm.append("category",         form.category);
      vpForm.append("store_description",form.store_description);
      vpForm.append("bank_account", JSON.stringify({
        bank_name:      form.bank_name,
        account_holder: form.account_holder,
        account_number: form.account_number,
        branch_name:    form.branch_name,
        mobile_money:   form.mobile_money,
      }));
      if (form.store_logo) vpForm.append("store_logo", form.store_logo);
      await axios.patch("/api/users/vendor-profile/me/", vpForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 3. Create address
      await axios.post("/api/users/addresses/", {
        address_type:   "OFFICE",
        street_address: form.street_address,
        city:           form.city,
        state:          form.state,
        postal_code:    form.postal_code,
        country:        form.country,
        is_default:     true,
      });

      // 4. Submit KYC documents
      const kycForm = new FormData();
      requirements.forEach(r => {
        const file = docFiles[r.code];
        if (file) {
          kycForm.append(`requirement_${r.code}_file`, file);
        }
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

  // ── Step content ─────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // ── Step 0: Personal & Store Info
      case 0:
        return (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="First Name" required value={form.first_name} onChange={e => set("first_name", e.target.value)} error={errors.first_name} placeholder="John" />
              <FormInput label="Last Name"  required value={form.last_name}  onChange={e => set("last_name",  e.target.value)} error={errors.last_name}  placeholder="Doe"  />
            </div>
            <FormInput label="Phone Number" type="tel" value={form.phone_number} onChange={e => set("phone_number", e.target.value)} placeholder="+1 555 000 0000" />
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Store Details</p>
              <div className="space-y-4">
                <FormInput label="Store Name"    required value={form.store_name}    onChange={e => set("store_name",    e.target.value)} error={errors.store_name}    placeholder="My Awesome Store" />
                <FormInput label="Business Name" required value={form.business_name} onChange={e => set("business_name", e.target.value)} error={errors.business_name} placeholder="Doe Enterprises Ltd." />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormSelect label="Business Type" required value={form.business_type} onChange={e => set("business_type", e.target.value)} error={errors.business_type} options={BUSINESS_TYPES} />
                  <FormInput  label="Category"      value={form.category}      onChange={e => set("category", e.target.value)}      placeholder="e.g. Electronics" />
                </div>
                <FormTextarea label="Store Description" value={form.store_description} onChange={e => set("store_description", e.target.value)} placeholder="Describe your store and products…" rows={3} />
              </div>
            </div>
            <FileDropZone label="Store Logo" hint="Optional — recommended 1:1 aspect ratio" file={form.store_logo} onChange={f => set("store_logo", f)} />
          </div>
        );

      // ── Step 1: Business Address
      case 1:
        return (
          <div className="space-y-5">
            <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" />
              Enter the address of your primary business location.
            </div>
            <FormInput label="Street Address" required value={form.street_address} onChange={e => set("street_address", e.target.value)} error={errors.street_address} placeholder="123 Main Street" />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="City"    required value={form.city}    onChange={e => set("city",    e.target.value)} error={errors.city}    placeholder="Addis Ababa" />
              <FormInput label="State / Region"   value={form.state}   onChange={e => set("state",   e.target.value)}                        placeholder="Oromia" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="Postal Code" value={form.postal_code} onChange={e => set("postal_code", e.target.value)} placeholder="1000" />
              <FormInput label="Country" required value={form.country} onChange={e => set("country", e.target.value)} error={errors.country} placeholder="Ethiopia" />
            </div>
          </div>
        );

      // ── Step 2: Bank Information
      case 2:
        return (
          <div className="space-y-5">
            <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-700 flex items-center gap-2">
              <Banknote className="w-4 h-4 shrink-0" />
              This information will be used for payout processing. Ensure accuracy.
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="Bank Name"          required value={form.bank_name}      onChange={e => set("bank_name",      e.target.value)} error={errors.bank_name}      placeholder="Commercial Bank of Ethiopia" />
              <FormInput label="Account Holder Name" required value={form.account_holder} onChange={e => set("account_holder", e.target.value)} error={errors.account_holder} placeholder="John Doe" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="Account Number" required value={form.account_number} onChange={e => set("account_number", e.target.value)} error={errors.account_number} placeholder="1000123456789" />
              <FormInput label="Branch Name"            value={form.branch_name}    onChange={e => set("branch_name",    e.target.value)}                               placeholder="Main Branch" />
            </div>
            <FormInput label="Mobile Money / Wallet (Optional)" value={form.mobile_money} onChange={e => set("mobile_money", e.target.value)} placeholder="+251 91 234 5678" />
          </div>
        );

      // ── Step 3: Documents
      case 3:
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

      // ── Step 4: Review & Submit
      case 4:
        return (
          <div className="space-y-5">
            <ReviewSection title="Personal & Store" icon={<User2 className="w-4 h-4" />}>
              <ReviewRow label="Name"          value={`${form.first_name} ${form.last_name}`} />
              <ReviewRow label="Phone"         value={form.phone_number || "—"} />
              <ReviewRow label="Store Name"    value={form.store_name} />
              <ReviewRow label="Business Name" value={form.business_name} />
              <ReviewRow label="Business Type" value={BUSINESS_TYPES.find(b => b.value === form.business_type)?.label ?? form.business_type} />
              <ReviewRow label="Category"      value={form.category || "—"} />
            </ReviewSection>

            <ReviewSection title="Business Address" icon={<MapPin className="w-4 h-4" />}>
              <ReviewRow label="Street"  value={form.street_address} />
              <ReviewRow label="City"    value={`${form.city}${form.state ? `, ${form.state}` : ""}`} />
              <ReviewRow label="Country" value={form.country} />
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

// ── Sub-components for review step ───────────────────────────────────────────
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

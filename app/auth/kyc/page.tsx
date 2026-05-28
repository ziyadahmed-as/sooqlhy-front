// app/auth/kyc/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "@/lib/api/axios";
import { useAuthStore } from "@/stores/auth-store";
import FileUploadCard, { FileUploadData } from "@/components/shared/FileUploadCard";
import { KycRequirement } from "../../../lib/types/kyc";

/**
 * KYC onboarding wizard – a premium multi‑step flow.
 * 1️⃣ Fetch required documents for the logged‑in user.
 * 2️⃣ Render an upload card for each requirement (with live‑photo validation).
 * 3️⃣ Submit all files together to the backend and refresh the user state.
 */
export default function KycWizard() {
  const router = useRouter();
  const { accessToken, setUser } = useAuthStore();
  const [requirements, setRequirements] = useState<KycRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploaded, setUploaded] = useState<FileUploadData[]>([]);

  // ---------------------------------------------------------------------------
  // 1️⃣ Fetch the list of required documents from the backend
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!accessToken) return;
    const fetch = async () => {
      try {
        const res = await axios.get<KycRequirement[]>("/api/kyc/me/requirements/");
        setRequirements(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [accessToken]);

  // ---------------------------------------------------------------------------
  // Handler for a single card's successful upload (stores the data locally)
  // ---------------------------------------------------------------------------
  const handleCardSubmit = async (data: FileUploadData) => {
    setUploaded(prev => {
      const without = prev.filter(d => d.requirement.code !== data.requirement.code);
      return [...without, data];
    });
  };

  // ---------------------------------------------------------------------------
  // 3️⃣ Submit everything to the backend
  // ---------------------------------------------------------------------------
  const handleSubmitAll = async () => {
    setSubmitting(true);
    const form = new FormData();
    uploaded.forEach(d => {
      form.append(`requirement_${d.requirement.code}_file`, d.file);
      form.append(`requirement_${d.requirement.code}_reference`, d.referenceNumber);
      form.append(`requirement_${d.requirement.code}_expiry`, d.expiryDate);
    });
    try {
      await axios.post("/api/kyc/me/submit/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Refresh the user – the backend will set is_verified accordingly
      const userRes = await axios.get("/api/users/users/me/");
      setUser(userRes.data);
      router.push("/"); // go to dashboard / home after success
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // UI rendering
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6f2]">
        <p className="text-lg text-gray-600">Loading KYC requirements…</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-[#0B1F3A] to-[#1a5fa8] p-8"
    >
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-lg rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-[#0B1F3A] mb-6">
          KYC Onboarding Wizard
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Please upload the required documents to complete your verification.
        </p>

        {/* Step 1 – list of requirements */}
        <ul className="list-disc list-inside mb-6 text-gray-700">
          {requirements.map(r => (
            <li key={r.id}>
              <strong>{r.name}</strong>: {r.description}
            </li>
          ))}
        </ul>

        {/* Step 2 – upload cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {requirements.map(r => (
            <FileUploadCard
              key={r.id}
              requirement={r}
              onSubmit={handleCardSubmit}
            />
          ))}
        </div>

        {/* Step 3 – final submit */}
        <div className="text-center">
          <button
            onClick={handleSubmitAll}
            disabled={submitting || uploaded.length !== requirements.length}
            className={`px-6 py-3 rounded-md font-medium transition-colors 
              ${submitting || uploaded.length !== requirements.length
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0B1F3A] hover:bg-[#1a5fa8] text-white"}`}
          >
            {submitting ? "Submitting…" : "Submit All Documents"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

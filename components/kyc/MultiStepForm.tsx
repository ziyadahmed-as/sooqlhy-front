// components/kyc/MultiStepForm.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  title: string;
  description: string;
}

interface MultiStepFormProps {
  steps: Step[];
  currentStep: number;
  children: React.ReactNode;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  canProceed?: boolean;
  isLastStep?: boolean;
}

export default function MultiStepForm({
  steps,
  currentStep,
  children,
  onNext,
  onPrev,
  onSubmit,
  isSubmitting = false,
  canProceed = true,
  isLastStep = false,
}: MultiStepFormProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">KYC Verification</h1>
          <p className="text-blue-200 mt-1 text-sm">Complete all steps to verify your account</p>
        </div>

        {/* Progress Steps */}
        <div className="relative flex items-center justify-between mb-10 px-2">
          {/* Line behind steps */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10 z-0" />
          <div
            className="absolute top-4 left-0 h-0.5 bg-blue-400 z-0 transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
                    done && "bg-blue-500 border-blue-500 text-white",
                    active && "bg-white border-white text-blue-900 shadow-lg shadow-blue-400/30 scale-110",
                    !done && !active && "bg-slate-800 border-slate-600 text-slate-400"
                  )}
                >
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn("text-[10px] font-medium text-center max-w-[60px] leading-tight hidden sm:block",
                  active ? "text-white" : "text-slate-400"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Step header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <p className="text-blue-200 text-xs font-medium uppercase tracking-widest">
              Step {currentStep + 1} of {steps.length}
            </p>
            <h2 className="text-white text-xl font-bold">{steps[currentStep].title}</h2>
            <p className="text-blue-100 text-sm mt-0.5">{steps[currentStep].description}</p>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="px-6 sm:px-8 pb-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onPrev}
              disabled={currentStep === 0}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>

            {isLastStep ? (
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting || !canProceed}
                className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit Application ✓"
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                disabled={!canProceed}
                className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200"
              >
                Continue →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

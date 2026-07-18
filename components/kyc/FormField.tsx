// components/kyc/FormField.tsx – Shared input, select and textarea helper
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BaseProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}

// ── Text / number / email / tel / date input ──────────────────────────────────
type InputProps = BaseProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof BaseProps | "id"> & {
    id?: string;
  };

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, required, error, hint, className, id, ...props }, ref) => {
    const uid = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={cn("space-y-1.5", className)}>
        <label htmlFor={uid} className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
        <input
          ref={ref}
          id={uid}
          {...props}
          className={cn(
            "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all",
            "placeholder:text-gray-300 bg-white",
            error
              ? "border-red-400 focus:ring-2 focus:ring-red-200"
              : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          )}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
FormInput.displayName = "FormInput";

// ── Select ─────────────────────────────────────────────────────────────────────
type SelectProps = BaseProps &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, keyof BaseProps | "id"> & {
    id?: string;
    options: { value: string; label: string }[];
  };

export const FormSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, required, error, hint, className, id, options, ...props }, ref) => {
    const uid = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={cn("space-y-1.5", className)}>
        <label htmlFor={uid} className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
        <select
          ref={ref}
          id={uid}
          {...props}
          className={cn(
            "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all bg-white",
            error
              ? "border-red-400 focus:ring-2 focus:ring-red-200"
              : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          )}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
FormSelect.displayName = "FormSelect";

// ── Textarea ──────────────────────────────────────────────────────────────────
type TextAreaProps = BaseProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, keyof BaseProps | "id"> & {
    id?: string;
  };

export const FormTextarea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, required, error, hint, className, id, ...props }, ref) => {
    const uid = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={cn("space-y-1.5", className)}>
        <label htmlFor={uid} className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
        <textarea
          ref={ref}
          id={uid}
          rows={3}
          {...props}
          className={cn(
            "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all resize-none bg-white",
            error
              ? "border-red-400 focus:ring-2 focus:ring-red-200"
              : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          )}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
FormTextarea.displayName = "FormTextarea";

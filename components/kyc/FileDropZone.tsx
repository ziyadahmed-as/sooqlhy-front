// components/kyc/FileDropZone.tsx
"use client";

import { useRef, useState, useCallback } from "react";
import { UploadCloud, X, FileText, Image, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const ALLOWED_EXT  = [".jpg", ".jpeg", ".png", ".pdf"];
const MAX_MB = 10;

interface FileDropZoneProps {
  label: string;
  hint?: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
}

export default function FileDropZone({
  label,
  hint,
  required = false,
  file,
  onChange,
  accept = ALLOWED_EXT.join(","),
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) return `Invalid type. Allowed: JPG, PNG, PDF`;
    if (f.size > MAX_MB * 1024 * 1024) return `File too large (max ${MAX_MB}MB)`;
    return null;
  }, []);

  const handleFile = (f: File) => {
    const err = validate(f);
    if (err) { setError(err); return; }
    setError(null);
    onChange(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const isImage = file && file.type.startsWith("image/");
  const previewUrl = isImage ? URL.createObjectURL(file) : null;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}

      {file ? (
        /* ── Preview state ── */
        <div className="relative rounded-xl border-2 border-blue-500 bg-blue-50 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          {isImage && previewUrl ? (
            <img src={previewUrl} alt="preview" className="w-12 h-12 object-cover rounded-lg border border-blue-200" />
          ) : (
            <FileText className="w-10 h-10 text-blue-400 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); setError(null); }}
            className="shrink-0 w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          className={cn(
            "relative rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200",
            dragging ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className={cn("w-8 h-8 transition-colors", dragging ? "text-blue-500" : "text-gray-300")} />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
              <span className="text-blue-600 underline underline-offset-2">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, PDF — max {MAX_MB}MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-600 flex items-center gap-1"><X className="w-3 h-3" />{error}</p>}
    </div>
  );
}

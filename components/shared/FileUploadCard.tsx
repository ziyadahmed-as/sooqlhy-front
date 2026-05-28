import React, { useState, useEffect } from 'react';
import { z } from 'zod';

/**
 * Props for a single KYC document requirement.
 */
interface Requirement {
  code: string; // e.g. "ID", "LIVE_PHOTO"
  name: string;
  description: string;
  type: string; // "image" | "pdf" | "live_photo" (treated as image with extra validation)
}

/**
 * Data emitted from the component after successful validation.
 */
export interface FileUploadData {
  requirement: Requirement;
  file: File;
  referenceNumber: string;
  expiryDate: string; // ISO string (yyyy-mm-dd)
}

/**
 * Props for the FileUploadCard component.
 */
interface Props {
  requirement: Requirement;
  /**
   * Called when the user presses the Submit button for this card.
   */
  onSubmit: (data: FileUploadData) => Promise<void>;
  /**
   * Optional initial data (used when editing a previously submitted document).
   */
  initialData?: Partial<FileUploadData>;
}

/**
 * Zod schema for client‑side validation of the upload form.
 */
const uploadSchema = z.object({
  file: z.custom<File>((val) => val instanceof File && (val as File).size <= 10 * 1024 * 1024, {
    message: 'File must be 10 MB or smaller',
  }),
  referenceNumber: z.string().min(1, { message: 'Reference number is required' }),
  expiryDate: z.string().refine((val) => !!Date.parse(val), {
    message: 'Valid expiry date is required',
  }),
});

export const FileUploadCard: React.FC<Props> = ({ requirement, onSubmit, initialData }) => {
  const [file, setFile] = useState<File | null>(initialData?.file ?? null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>(initialData?.referenceNumber ?? '');
  const [expiryDate, setExpiryDate] = useState<string>(initialData?.expiryDate ?? '');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Generate preview when file changes (image only)
  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl('');
    }
  }, [file]);

  /** Validate live‑photo dimensions if required */
  const validateLivePhoto = async (file: File) => {
    if (requirement.type !== 'live_photo') return true;
    return new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ok = img.width >= 300 && img.height >= 300;
        resolve(ok);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    // Basic size check
    if (selected.size > 10 * 1024 * 1024) {
      setError('File must be 10 MB or smaller');
      return;
    }
    // Live‑photo dimension check
    if (requirement.type === 'live_photo') {
      const ok = await validateLivePhoto(selected);
      if (!ok) {
        setError('Live photo must be at least 300 × 300 px');
        return;
      }
    }
    setError('');
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    const payload = {
      file,
      referenceNumber,
      expiryDate,
    };
    const result = uploadSchema.safeParse(payload);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        requirement,
        file,
        referenceNumber,
        expiryDate,
      });
      setError('');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload-card" style={cardStyle}>
      <h3 style={titleStyle}>{requirement.name}</h3>
      <p style={descStyle}>{requirement.description}</p>
      <div style={fieldGroupStyle}>
        <label htmlFor={`${requirement.code}-file`} style={labelStyle}>File</label>
        <input
          id={`${requirement.code}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          style={inputStyle}
        />
        {previewUrl && (
          <img src={previewUrl} alt="preview" style={previewStyle} />
        )}
      </div>
      <div style={fieldGroupStyle}>
        <label htmlFor={`${requirement.code}-ref`} style={labelStyle}>Reference number</label>
        <input
          id={`${requirement.code}-ref`}
          type="text"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={fieldGroupStyle}>
        <label htmlFor={`${requirement.code}-exp`} style={labelStyle}>Expiry date</label>
        <input
          id={`${requirement.code}-exp`}
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          style={inputStyle}
        />
      </div>
      {error && <p style={errorStyle}>⚠️ {error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        style={buttonStyle}
      >
        {loading ? 'Uploading…' : 'Submit'}
      </button>
    </div>
  );
};

/** Inline‑style constants – you can move these to a CSS module for cleaner code */
const cardStyle: React.CSSProperties = {
  border: '1px solid var(--gray-300)',
  borderRadius: '12px',
  padding: '1.5rem',
  marginBottom: '1.5rem',
  background: 'rgba(255,255,255,0.9)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};
const titleStyle: React.CSSProperties = { margin: 0, color: 'var(--brand-primary)' };
const descStyle: React.CSSProperties = { margin: '0.5rem 0 1rem', color: 'var(--gray-600)' };
const fieldGroupStyle: React.CSSProperties = { marginBottom: '1rem', display: 'flex', flexDirection: 'column' };
const labelStyle: React.CSSProperties = { marginBottom: '0.3rem', fontWeight: 500 };
const inputStyle: React.CSSProperties = { padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--gray-300)' };
const previewStyle: React.CSSProperties = { marginTop: '0.5rem', maxWidth: '120px', borderRadius: '6px' };
const errorStyle: React.CSSProperties = { color: 'var(--coral)', marginTop: '0.5rem' };
const buttonStyle: React.CSSProperties = {
  padding: '0.6rem 1.2rem',
  background: 'var(--brand-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
};

export default FileUploadCard;

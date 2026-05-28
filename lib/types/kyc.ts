// lib/types/kyc.ts
/**
 * Types related to the KYC onboarding flow.
 */
export interface KycRequirement {
  /** Primary key from the backend */
  id: number;
  /** Short code used for form‑data keys, e.g. "ID", "LIVE_PHOTO" */
  code: string;
  /** Human‑readable name shown in the UI */
  name: string;
  /** Description displayed below the name */
  description: string;
  /** MIME type or category (e.g. "image/jpeg", "application/pdf", "live_photo") */
  type: string;
  /** Flag indicating the requirement is a live‑photo that needs dimension validation */
  is_live_photo?: boolean;
}

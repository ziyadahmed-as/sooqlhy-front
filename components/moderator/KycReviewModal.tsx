"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  X, ShieldCheck, FileText, Image as ImageIcon, Download,
  Check, AlertTriangle, Clock, User, Mail, Phone, Building2,
  Truck, Calendar, Maximize2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Loader2, MessageSquare, History, Eye,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  fetchKycUserRecords, approveKyc, rejectKyc,
  type KycRecord, type KycReviewEntry, type KycApplicant,
} from "@/lib/api/moderator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Constants ───────────────────────────────────────────────────────────────

const REJECTION_REASONS = [
  "Blurry Document",
  "Expired ID",
  "Missing Document",
  "Incorrect Information",
  "Mismatched Identity",
  "Invalid Business License",
  "Unreadable Text",
  "Document Tampered",
  "Other",
];

const DOC_TYPE_LABELS: Record<string, string> = {
  NATIONAL_ID: "National ID",
  PASSPORT: "Passport",
  DRIVING_LICENSE: "Driving License",
  BUSINESS_LICENSE: "Business License",
  TAX_CERTIFICATE: "Tax Certificate",
  SELFIE: "Selfie Photo",
  ADDRESS_PROOF: "Address Verification",
  VEHICLE_REGISTRATION: "Vehicle Registration",
  INSURANCE: "Insurance Document",
  LIVE_PHOTO: "Live Photo",
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface KycReviewModalProps {
  record: KycRecord;
  onClose: () => void;
  onAction: () => void; // Called after approve/reject to refresh table
}

// ─── Document Viewer ─────────────────────────────────────────────────────────

function DocumentViewer({ url, onClose }: { url: string; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {!isPdf && (
          <>
            <button onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white text-sm font-medium min-w-[48px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <ZoomIn className="w-5 h-5" />
            </button>
          </>
        )}
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
          <Download className="w-5 h-5" />
        </a>
        <button onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="w-full h-full flex items-center justify-center overflow-auto p-10">
        {isPdf ? (
          <iframe src={url} className="w-full h-full rounded-lg bg-white" title="KYC Document" />
        ) : (
          <img src={url} alt="KYC Document"
            style={{ transform: `scale(${zoom})`, transition: "transform 0.2s" }}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        )}
      </div>
    </div>
  );
}

// ─── Document Card ───────────────────────────────────────────────────────────

function DocumentCard({ rec, onView }: { rec: KycRecord; onView: (url: string) => void }) {
  const fileUrl = rec.document_file || rec.LIVE_PHOTO;
  const isPdf = fileUrl?.toLowerCase().endsWith(".pdf");
  const isImage = fileUrl && !isPdf;
  const docLabel = DOC_TYPE_LABELS[rec.kyc_type] || rec.kyc_type?.replace(/_/g, " ");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative h-36 bg-gray-100 dark:bg-gray-900 flex items-center justify-center group">
        {isImage ? (
          <img src={fileUrl} alt={docLabel} className="w-full h-full object-cover" />
        ) : isPdf ? (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <FileText className="w-10 h-10" />
            <span className="text-xs">PDF Document</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300 dark:text-gray-600">
            <ImageIcon className="w-10 h-10" />
            <span className="text-xs">No file uploaded</span>
          </div>
        )}
        {fileUrl && (
          <button onClick={() => onView(fileUrl)}
            className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <Maximize2 className="w-6 h-6 text-white" />
          </button>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={rec.status} />
        </div>
      </div>
      {/* Info */}
      <div className="p-3 space-y-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{docLabel}</p>
        {rec.document_number && (
          <p className="text-xs text-gray-500 dark:text-gray-400">#{rec.document_number}</p>
        )}
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          {rec.submitted_at ? new Date(rec.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
        </p>
      </div>
    </div>
  );
}

// ─── Review Timeline ─────────────────────────────────────────────────────────

function ReviewTimeline({ reviews }: { reviews: KycReviewEntry[] }) {
  if (!reviews.length) return (
    <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-4">No review history yet.</p>
  );
  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="flex gap-3">
          <div className={cn(
            "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
            r.status === "APPROVED" ? "bg-green-500" : r.status === "REJECTED" ? "bg-red-500" : "bg-amber-500"
          )} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={r.status} />
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(r.reviewed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
              by <span className="font-medium">{r.reviewer_name || "System"}</span>
            </p>
            {r.rejection_reason && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Reason: {r.rejection_reason}</p>
            )}
            {r.admin_comments && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">"{r.admin_comments}"</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────────────

export default function KycReviewModal({ record, onClose, onAction }: KycReviewModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [allRecords, setAllRecords] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"documents" | "history">("documents");

  // Action state
  const [actionLoading, setActionLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectComment, setRejectComment] = useState("");
  const [approveComment, setApproveComment] = useState("");
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const applicant: KycApplicant | null = record.user_details ?? null;

  // Load all records for this user
  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchKycUserRecords(record.id);
      setAllRecords(data);
    } catch {
      setAllRecords([record]);
    } finally {
      setLoading(false);
    }
  }, [record]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ESC to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") { viewerUrl ? setViewerUrl(null) : onClose(); } };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, viewerUrl]);

  // Collect all reviews across all records, sorted newest first
  const allReviews = allRecords
    .flatMap((r) => r.reviews.map((rev) => ({ ...rev, docType: r.kyc_type })))
    .sort((a, b) => new Date(b.reviewed_at).getTime() - new Date(a.reviewed_at).getTime());

  // Pending records (actionable)
  const pendingRecords = allRecords.filter((r) => r.status === "PENDING" || r.status === "UNDER_REVIEW");

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      for (const rec of pendingRecords) {
        await approveKyc(rec.id, approveComment);
      }
      toast.success(`KYC approved for ${applicant?.full_name || record.user_email}`);
      onAction();
      onClose();
    } catch {
      toast.error("Failed to approve KYC");
    } finally {
      setActionLoading(false);
      setShowApproveConfirm(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      for (const rec of pendingRecords) {
        await rejectKyc(rec.id, rejectReason, rejectComment);
      }
      toast.success(`KYC rejected for ${applicant?.full_name || record.user_email}`);
      onAction();
      onClose();
    } catch {
      toast.error("Failed to reject KYC");
    } finally {
      setActionLoading(false);
      setShowReject(false);
    }
  };

  return (
    <>
      {/* Full-screen document viewer */}
      {viewerUrl && <DocumentViewer url={viewerUrl} onClose={() => setViewerUrl(null)} />}

      {/* Modal overlay */}
      <div ref={overlayRef}
        className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 pt-8 pb-8"
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}>

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">KYC Review</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {applicant?.full_name || record.user_email} · {applicant?.role || ""}
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Body ───────────────────────────────────────────────── */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

            {/* Applicant Summary Card */}
            {applicant && (
              <div className="bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-950/20 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoRow icon={<User className="w-4 h-4" />} label="Full Name" value={applicant.full_name} />
                  <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={applicant.email} />
                  <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={applicant.phone_number || "—"} />
                  <InfoRow icon={<ShieldCheck className="w-4 h-4" />} label="Role" value={applicant.role} />
                  <InfoRow icon={<Calendar className="w-4 h-4" />} label="Joined"
                    value={new Date(applicant.date_joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                    <StatusBadge status={applicant.is_verified ? "APPROVED" : "PENDING"} />
                  </div>
                </div>

                {/* Vendor/Driver specific info */}
                {applicant.vendor_profile && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoRow icon={<Building2 className="w-4 h-4" />} label="Business Name" value={applicant.vendor_profile.business_name || "—"} />
                    <InfoRow icon={<Building2 className="w-4 h-4" />} label="Store Name" value={applicant.vendor_profile.store_name || "—"} />
                  </div>
                )}
                {applicant.driver_profile && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <InfoRow icon={<Truck className="w-4 h-4" />} label="Vehicle" value={applicant.driver_profile.vehicle_type || "—"} />
                    <InfoRow icon={<Truck className="w-4 h-4" />} label="Plate" value={applicant.driver_profile.plate_number || "—"} />
                    <InfoRow icon={<FileText className="w-4 h-4" />} label="License #" value={applicant.driver_profile.license_number || "—"} />
                  </div>
                )}
              </div>
            )}

            {/* Tabs: Documents | History */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button onClick={() => setActiveTab("documents")}
                className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-colors",
                  activeTab === "documents" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700")}>
                <Eye className="w-4 h-4" /> Documents ({allRecords.length})
              </button>
              <button onClick={() => setActiveTab("history")}
                className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-colors",
                  activeTab === "history" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700")}>
                <History className="w-4 h-4" /> Review History ({allReviews.length})
              </button>
            </div>

            {/* Documents Tab */}
            {activeTab === "documents" && (
              loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-52 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : allRecords.length === 0 ? (
                <div className="text-center py-8">
                  <ShieldCheck className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">No KYC documents found for this user.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {allRecords.map((rec) => (
                    <DocumentCard key={rec.id} rec={rec} onView={setViewerUrl} />
                  ))}
                </div>
              )
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <ReviewTimeline reviews={allReviews} />
              </div>
            )}
          </div>

          {/* ── Footer Actions ─────────────────────────────────────── */}
          {pendingRecords.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
              {/* Approve Confirmation */}
              {showApproveConfirm ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Approve {pendingRecords.length} pending document{pendingRecords.length > 1 ? "s" : ""}?
                  </p>
                  <textarea value={approveComment} onChange={(e) => setApproveComment(e.target.value)}
                    placeholder="Optional reviewer notes..." rows={2}
                    className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                  <div className="flex gap-3">
                    <button onClick={() => setShowApproveConfirm(false)}
                      className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleApprove} disabled={actionLoading}
                      className="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                      {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Confirm Approval
                    </button>
                  </div>
                </div>
              ) : showReject ? (
                /* Reject Form */
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Reject {pendingRecords.length} pending document{pendingRecords.length > 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {REJECTION_REASONS.map((r) => (
                      <button key={r} onClick={() => setRejectReason(r)}
                        className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                          rejectReason === r
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-300")}>
                        {r}
                      </button>
                    ))}
                  </div>
                  <textarea value={rejectComment} onChange={(e) => setRejectComment(e.target.value)}
                    placeholder="Additional notes (optional)..." rows={2}
                    className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                  <div className="flex gap-3">
                    <button onClick={() => { setShowReject(false); setRejectReason(""); setRejectComment(""); }}
                      className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleReject} disabled={actionLoading || !rejectReason.trim()}
                      className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                      {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              ) : (
                /* Default Action Buttons */
                <div className="flex gap-3">
                  <button onClick={() => setShowApproveConfirm(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors">
                    <Check className="w-4 h-4" /> Approve All
                  </button>
                  <button onClick={() => setShowReject(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">
                    <AlertTriangle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}

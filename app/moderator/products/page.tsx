"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  fetchModerationQueue, approveProduct, rejectProduct, bulkApproveProducts,
} from "@/lib/api/moderator";
import type { Product, ProductStatus } from "@/lib/types";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Clock, ShieldCheck, Package, Search,
  RefreshCw, ChevronDown, AlertTriangle, Eye, Star, DollarSign,
  BarChart3, Filter, X, Check, Loader2,
} from "lucide-react";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  SUBMITTED:    { label: "Submitted",    color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",   icon: <Clock className="w-3 h-3" /> },
  UNDER_REVIEW: { label: "Under Review", color: "text-amber-700",  bg: "bg-amber-50 border-amber-200", icon: <Eye className="w-3 h-3" /> },
  APPROVED:     { label: "Approved",     color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  REJECTED:     { label: "Rejected",     color: "text-red-700",    bg: "bg-red-50 border-red-200",     icon: <XCircle className="w-3 h-3" /> },
  DRAFT:        { label: "Draft",        color: "text-gray-600",   bg: "bg-gray-50 border-gray-200",   icon: <Package className="w-3 h-3" /> },
  ARCHIVED:     { label: "Archived",     color: "text-gray-500",   bg: "bg-gray-50 border-gray-200",   icon: <Package className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Reject modal ─────────────────────────────────────────────────────────────
function RejectModal({ product, onConfirm, onCancel }: {
  product: Product;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const QUICK = ["Blurry images", "Incorrect category", "Missing description", "Prohibited item", "Duplicate listing", "Price issue"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" /> Reject Product
          </h3>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-gray-600">Rejecting <span className="font-semibold text-gray-900">{product.name || product.title}</span></p>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button key={q} onClick={() => setReason(q)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${reason === q ? "bg-red-500 text-white border-red-500" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600"}`}>
                {q}
              </button>
            ))}
          </div>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            placeholder="Or write a custom reason…"
            className="w-full text-sm rounded-xl border border-gray-200 p-3 focus:outline-none focus:border-red-400 resize-none" />
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => reason.trim() && onConfirm(reason.trim())} disabled={!reason.trim()}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product detail drawer ────────────────────────────────────────────────────
function ProductDrawer({ product, onClose, onApprove, onReject }: {
  product: Product;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const imgs = product.images as any[];
  const primaryImg = imgs?.length ? (typeof imgs[0] === "string" ? imgs[0] : imgs[0]?.image) : null;
  const name = product.name || product.title || "Untitled";
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-gray-900 truncate pr-4">{name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 px-6 py-5 space-y-5">
          {primaryImg && (
            <div className="relative h-56 rounded-xl overflow-hidden bg-gray-100">
              <Image src={primaryImg} alt={name} fill className="object-cover" sizes="500px" />
            </div>
          )}
          <div className="flex items-center justify-between">
            <StatusBadge status={product.status || "SUBMITTED"} />
            <span className="text-xl font-black text-gray-900">${Number(product.price ?? 0).toFixed(2)}</span>
          </div>
          {product.description && <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {product.category_name && <div className="bg-gray-50 rounded-lg p-3"><p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Category</p><p className="font-semibold text-gray-800">{product.category_name}</p></div>}
            {product.stock != null && <div className="bg-gray-50 rounded-lg p-3"><p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Stock</p><p className="font-semibold text-gray-800">{product.stock} units</p></div>}
            {product.average_rating != null && <div className="bg-gray-50 rounded-lg p-3"><p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Rating</p><p className="font-semibold text-gray-800 flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{Number(product.average_rating).toFixed(1)}</p></div>}
            {product.created_at && <div className="bg-gray-50 rounded-lg p-3"><p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Submitted</p><p className="font-semibold text-gray-800">{new Date(product.created_at).toLocaleDateString()}</p></div>}
          </div>
          {product.rejection_reason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-xs font-bold text-red-600 mb-1">Previous Rejection Reason</p>
              <p className="text-sm text-red-700">{product.rejection_reason}</p>
            </div>
          )}
        </div>
        {(product.status === "SUBMITTED" || product.status === "UNDER_REVIEW") && (
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
            <button onClick={onReject} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors">
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button onClick={onApprove} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product row card ─────────────────────────────────────────────────────────
function ProductRow({ product, selected, onSelect, onApprove, onReject, onView, approving, rejecting }: {
  product: Product;
  selected: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onReject: () => void;
  onView: () => void;
  approving: boolean;
  rejecting: boolean;
}) {
  const imgs = product.images as any[];
  const imgSrc = imgs?.length ? (typeof imgs[0] === "string" ? imgs[0] : imgs[0]?.image) : null;
  const name = product.name || product.title || "Untitled";
  const vendorName = typeof product.vendor === "string" ? product.vendor : (product.vendor as any)?.email ?? "—";
  const isPending = product.status === "SUBMITTED" || product.status === "UNDER_REVIEW";

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${selected ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-100"}`}>
      <div className="flex items-start gap-4 p-4">
        <input type="checkbox" checked={selected} onChange={onSelect}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer flex-shrink-0" />
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {imgSrc ? <Image src={imgSrc} alt={name} fill className="object-cover" sizes="64px" />
            : <div className="w-full h-full flex items-center justify-center"><Package className="w-7 h-7 text-gray-300" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{vendorName} · {product.category_name || "No category"}</p>
            </div>
            <StatusBadge status={product.status || "SUBMITTED"} />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm font-black text-gray-900 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-gray-400" />{Number(product.price ?? 0).toFixed(2)}</span>
            {product.stock != null && <span className="text-xs text-gray-500">Stock: {product.stock}</span>}
            {(product.average_rating ?? 0) > 0 && (
              <span className="text-xs text-gray-500 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{Number(product.average_rating).toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 px-4 pb-4">
        <button onClick={onView} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Eye className="w-3.5 h-3.5" /> Details
        </button>
        {isPending && (
          <>
            <button onClick={onApprove} disabled={approving} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 transition-colors">
              {approving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Approve
            </button>
            <button onClick={onReject} disabled={rejecting} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:opacity-50 transition-colors">
              {rejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />} Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ModeratorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, "approve" | "reject">>({});
  const [bulkLoading, setBulkLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadQueue = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await fetchModerationQueue();
      const results: Product[] = Array.isArray(data) ? data : (data as any).results ?? [];
      setProducts(results);
    } catch (e: unknown) {
      setError((e as any)?.message || "Failed to load moderation queue");
      if (!silent) toast.error("Failed to load moderation queue");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  // Filtered + searched list
  const filtered = useMemo(() => {
    let list = products;
    if (statusFilter === "PENDING") list = list.filter((p) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW");
    else if (statusFilter !== "ALL") list = list.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => (p.name || p.title || "").toLowerCase().includes(q) || (p.category_name || "").toLowerCase().includes(q));
    }
    return list;
  }, [products, statusFilter, search]);

  // Stats
  const stats = useMemo(() => ({
    pending: products.filter((p) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW").length,
    approved: products.filter((p) => p.status === "APPROVED").length,
    rejected: products.filter((p) => p.status === "REJECTED").length,
    total: products.length,
  }), [products]);

  const handleApprove = async (p: Product) => {
    setActionLoading((prev) => ({ ...prev, [p.id]: "approve" }));
    try {
      await approveProduct(p.id);
      toast.success(`"${p.name || p.title}" approved`);
      loadQueue(true);
      if (drawerProduct?.id === p.id) setDrawerProduct(null);
    } catch { toast.error("Failed to approve product"); }
    finally { setActionLoading((prev) => { const n = { ...prev }; delete n[p.id]; return n; }); }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    const p = rejectTarget;
    setRejectTarget(null);
    setActionLoading((prev) => ({ ...prev, [p.id]: "reject" }));
    try {
      await rejectProduct(p.id, reason);
      toast.success(`"${p.name || p.title}" rejected`);
      loadQueue(true);
      if (drawerProduct?.id === p.id) setDrawerProduct(null);
    } catch { toast.error("Failed to reject product"); }
    finally { setActionLoading((prev) => { const n = { ...prev }; delete n[p.id]; return n; }); }
  };

  const toggleSelect = (id: string) => setSelectedIds((prev) => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((p) => p.id)));
  };

  const handleBulkApprove = async () => {
    if (!selectedIds.size) return;
    setBulkLoading(true);
    try {
      await bulkApproveProducts(Array.from(selectedIds));
      toast.success(`${selectedIds.size} products approved`);
      setSelectedIds(new Set());
      loadQueue(true);
    } catch { toast.error("Bulk approval failed"); }
    finally { setBulkLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Product Moderation
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Review and approve vendor product submissions</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button onClick={handleBulkApprove} disabled={bulkLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-sm">
                {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Approve {selectedIds.size} Selected
              </button>
            )}
            <button onClick={() => loadQueue(true)} disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Pending Review" value={stats.pending} color="bg-amber-50" icon={<Clock className="w-5 h-5 text-amber-600" />} />
          <StatCard label="Approved" value={stats.approved} color="bg-emerald-50" icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} />
          <StatCard label="Rejected" value={stats.rejected} color="bg-red-50" icon={<XCircle className="w-5 h-5 text-red-500" />} />
          <StatCard label="Total in Queue" value={stats.total} color="bg-blue-50" icon={<BarChart3 className="w-5 h-5 text-blue-600" />} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or category…"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none bg-white transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {["PENDING", "ALL", "APPROVED", "REJECTED"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                {s === "PENDING" ? "Pending" : s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          {filtered.length > 0 && (
            <button onClick={toggleAll} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors">
              <ChevronDown className="w-3.5 h-3.5" />
              {selectedIds.size === filtered.length ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-red-100 p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-900 mb-1">Failed to load queue</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button onClick={() => loadQueue()} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="font-bold text-gray-900 text-lg mb-1">{search ? "No results found" : "Queue is clear"}</p>
            <p className="text-sm text-gray-400">{search ? "Try a different search term" : "All products have been reviewed"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProductRow key={p.id} product={p} selected={selectedIds.has(p.id)} onSelect={() => toggleSelect(p.id)}
                onApprove={() => handleApprove(p)} onReject={() => setRejectTarget(p)}
                onView={() => setDrawerProduct(p)}
                approving={actionLoading[p.id] === "approve"} rejecting={actionLoading[p.id] === "reject"} />
            ))}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {drawerProduct && (
        <ProductDrawer product={drawerProduct} onClose={() => setDrawerProduct(null)}
          onApprove={() => handleApprove(drawerProduct)}
          onReject={() => { setRejectTarget(drawerProduct); setDrawerProduct(null); }} />
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal product={rejectTarget} onConfirm={handleRejectConfirm} onCancel={() => setRejectTarget(null)} />
      )}
    </div>
  );
}

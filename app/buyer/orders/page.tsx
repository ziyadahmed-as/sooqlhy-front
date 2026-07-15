"use client";
import { useState } from "react";
import { fetchBuyerOrders, cancelOrder } from "@/lib/api/orders";
import { usePaginatedApi } from "@/lib/hooks/usePaginatedApi";
import type { Order } from "@/lib/types";
import { Pagination } from "@/components/shared/Pagination";
import { toast } from "sonner";
import Link from "next/link";
import {
  ShoppingBag, Package, Clock, CheckCircle2, XCircle,
  Truck, ArrowRight, RotateCcw, ChevronDown,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING:    { label: "Pending",    color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",   icon: <Clock className="w-3 h-3" /> },
  PROCESSING: { label: "Processing", color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",     icon: <RotateCcw className="w-3 h-3" /> },
  SHIPPED:    { label: "Shipped",    color: "text-purple-700",  bg: "bg-purple-50 border-purple-200", icon: <Truck className="w-3 h-3" /> },
  DELIVERED:  { label: "Delivered",  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  CANCELLED:  { label: "Cancelled",  color: "text-red-700",     bg: "bg-red-50 border-red-200",       icon: <XCircle className="w-3 h-3" /> },
  COMPLETED:  { label: "Completed",  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

const STATUS_OPTIONS = ["", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function BuyerOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [cancelling, setCancelling] = useState<string | null>(null);

  const { data: orders, loading, error, page, totalPages, setPage, refetch } =
    usePaginatedApi<Order>((p) => fetchBuyerOrders({ page: p, status: statusFilter }), 10, [statusFilter]);

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this order?")) return;
    setCancelling(id);
    try {
      await cancelOrder(id);
      toast.success("Order cancelled");
      refetch();
    } catch { toast.error("Unable to cancel this order"); }
    finally { setCancelling(null); }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING").length,
    delivered: orders.filter((o) => o.status === "DELIVERED" || o.status === "COMPLETED").length,
  };

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><ShoppingBag className="w-6 h-6 text-navy" /> My Orders</h1>
            <p className="text-sm text-gray-400 mt-0.5">Track and manage your purchases</p>
          </div>
          <Link href="/buyer/catalog" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy text-white text-sm font-bold hover:bg-trust transition-colors">
            Shop More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          {[["Total Orders", stats.total, "bg-blue-50", "text-blue-700"], ["In Progress", stats.pending, "bg-amber-50", "text-amber-700"], ["Delivered", stats.delivered, "bg-emerald-50", "text-emerald-700"]].map(([label, val, bg, color]) => (
            <div key={label as string} className={`rounded-xl ${bg} px-4 py-3`}>
              <p className={`text-2xl font-black ${color}`}>{val}</p>
              <p className={`text-xs ${color} opacity-70`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 font-medium">Filter:</span>
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${statusFilter === s ? "bg-navy text-white border-navy" : "bg-white text-gray-600 border-gray-200 hover:border-navy"}`}>
              {s || "All Orders"}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2"><div className="h-4 bg-gray-100 rounded w-1/3" /><div className="h-3 bg-gray-100 rounded w-1/4" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
            <XCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
            <p className="font-bold text-gray-900 mb-1">Failed to load orders</p>
            <button onClick={refetch} className="mt-3 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-bold hover:bg-trust transition-colors">Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="font-bold text-gray-900 text-lg mb-1">No orders yet</p>
            <p className="text-sm text-gray-400 mb-5">Start shopping to see your orders here</p>
            <Link href="/buyer/catalog" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-bold hover:bg-trust transition-colors">Browse Catalog <ArrowRight className="w-4 h-4" /></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-navy" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm font-mono">Order #{(o as any).order_number || o.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{o.created_at ? new Date(o.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}</p>
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span><span className="text-gray-400">Items:</span> {(o as any).items?.length ?? "—"}</span>
                    <span className="font-black text-gray-900">${Number((o as any).total || (o as any).total_amount || 0).toFixed(2)}</span>
                    {(o as any).tracking_number && <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg">📦 {(o as any).tracking_number}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {(o.status === "PENDING" || o.status === "PROCESSING") && (
                      <button onClick={() => handleCancel(o.id)} disabled={cancelling === o.id}
                        className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 disabled:opacity-50 transition-colors">
                        {cancelling === o.id ? "Cancelling…" : "Cancel"}
                      </button>
                    )}
                    <Link href={`/buyer/orders/${o.id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-navy text-white text-xs font-bold hover:bg-trust transition-colors">
                      View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

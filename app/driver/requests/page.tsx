"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchDriverAssignments, acceptAssignment, rejectAssignment, type DriverOrder, type RejectionReason } from "@/lib/api/driver";
import { useDriverStore } from "@/stores/driver-store";
import { DriverPageWrapper } from "@/components/driver/DriverPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bell, MapPin, Package, Check, X, RefreshCw, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const REJECTION_REASONS: { value: RejectionReason; label: string }[] = [
  { value: "TOO_FAR", label: "Too Far" },
  { value: "VEHICLE_ISSUE", label: "Vehicle Issue" },
  { value: "BUSY", label: "Already Busy" },
  { value: "PERSONAL", label: "Personal Reason" },
  { value: "OTHER", label: "Other" },
];

function RequestCard({ order, onRefresh }: { order: DriverOrder; onRefresh: () => void }) {
  const [accepting, setAccepting] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState<RejectionReason>("TOO_FAR");
  const [rejecting, setRejecting] = useState(false);

  const address = order.shipping_address;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acceptAssignment(order.id);
      toast.success(`Order #${order.id} accepted!`);
      onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to accept");
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await rejectAssignment(order.id, reason);
      toast.success("Order rejected. It will be reassigned automatically.");
      setShowReject(false);
      onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to reject");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Pulsing new badge */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900 dark:text-white">Order #{order.id}</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold animate-pulse">
              <Bell className="w-2.5 h-2.5" /> NEW
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Details */}
      <div className="px-5 py-3 space-y-2.5">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delivery Address</p>
            <p className="text-gray-900 dark:text-white">
              {address ? `${address.street_address ?? ""}, ${address.city}, ${address.state}` : "Address not available"}
            </p>
          </div>
        </div>
        {order.items.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Package className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</p>
              <p className="text-gray-700 dark:text-gray-300">{order.items.map((i) => `${i.product_name} ×${i.quantity}`).join(", ")}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order Value</p>
            <p className="font-bold text-gray-900 dark:text-white">${Number(order.total_amount).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Reject panel */}
      {showReject && (
        <div className="px-5 py-3 bg-red-50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-800/30">
          <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">Select rejection reason:</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {REJECTION_REASONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setReason(value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  reason === value
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-red-300"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={rejecting}
              className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {rejecting ? "Rejecting..." : "Confirm Reject"}
            </button>
            <button
              onClick={() => setShowReject(false)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!showReject && (
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Check className="w-4 h-4" />
            {accepting ? "Accepting..." : "Accept Order"}
          </button>
          <button
            onClick={() => setShowReject(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <X className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function OrderRequestsPage() {
  const { loadStats } = useDriverStore();
  const [requests, setRequests] = useState<DriverOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchDriverAssignments();
      // Show only PENDING orders as "requests"
      setRequests(all.filter((o) => o.status === "PENDING"));
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.allSettled([load(), loadStats()]);
  }, [load, loadStats]);

  useEffect(() => { load(); }, [load]);

  return (
    <DriverPageWrapper
      title="Order Requests"
      subtitle="New delivery requests waiting for your response."
      actions={
        <button onClick={refresh} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-56 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No pending requests"
          description="New delivery requests will appear here. Make sure you are Online to receive them."
          icon={<Bell className="h-12 w-12" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((order) => (
            <RequestCard key={order.id} order={order} onRefresh={refresh} />
          ))}
        </div>
      )}
    </DriverPageWrapper>
  );
}

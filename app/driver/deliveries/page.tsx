"use client";
import { useCallback, useEffect, useState } from "react";
import { useDriverStore } from "@/stores/driver-store";
import { updateDeliveryStatus, uploadDeliveryProof, type DeliveryStatusUpdate, type DriverOrder } from "@/lib/api/driver";
import { DriverPageWrapper } from "@/components/driver/DriverPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Truck, MapPin, Package, ChevronDown, Camera, RefreshCw, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const WORKFLOW_STEPS: { status: DeliveryStatusUpdate; label: string }[] = [
  { status: "TRAVELING_TO_VENDOR", label: "Traveling to Vendor" },
  { status: "PICKED_UP", label: "Picked Up" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

function DeliveryCard({ order, onRefresh }: { order: DriverOrder; onRefresh: () => void }) {
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const handleStatusUpdate = async (status: DeliveryStatusUpdate) => {
    setUpdating(true);
    try {
      await updateDeliveryStatus(order.id, status);
      toast.success(`Status updated: ${status.replace(/_/g, " ")}`);
      onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      await uploadDeliveryProof(order.id, files[0], files[1]);
      toast.success("Delivery proof uploaded successfully");
      onRefresh();
    } catch {
      toast.error("Failed to upload proof");
    } finally {
      setUploading(false);
    }
  };

  const lastTracking = order.tracking_history?.[0];
  const address = order.shipping_address;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Order #{order.id}</p>
          <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Order details */}
      <div className="px-5 py-3 space-y-2">
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
          <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
          <span>{address ? `${address.street_address ?? ""}, ${address.city}, ${address.country}` : "No address"}</span>
        </div>
        {order.items.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{order.items.map((i) => `${i.product_name} ×${i.quantity}`).join(", ")}</span>
          </div>
        )}
        {order.customer_notes && (
          <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-3 py-1.5 rounded-lg">
            📝 {order.customer_notes}
          </p>
        )}
        {lastTracking && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            Last update: {lastTracking.status.replace(/_/g, " ")} — {new Date(lastTracking.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Workflow buttons */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Update Status</p>
        <div className="flex flex-wrap gap-2">
          {WORKFLOW_STEPS.map(({ status, label }) => (
            <button
              key={status}
              onClick={() => handleStatusUpdate(status)}
              disabled={updating}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50",
                order.status === "DELIVERED"
                  ? "border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed"
                  : "border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              )}
            >
              {updating ? "..." : label}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery proof upload */}
      {order.status !== "DELIVERED" && (
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            Upload Delivery Proof
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showUpload && "rotate-180")} />
          </button>
          {showUpload && (
            <div className="mt-2">
              <label className={cn(
                "flex items-center justify-center gap-2 w-full py-2 rounded-lg border-2 border-dashed text-sm font-medium cursor-pointer transition-colors",
                uploading
                  ? "border-gray-200 text-gray-400"
                  : "border-blue-300 dark:border-blue-700 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10"
              )}>
                <Camera className="w-4 h-4" />
                {uploading ? "Uploading..." : "Choose Photo(s)"}
                <input type="file" accept="image/*" multiple onChange={handleProofUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Amount */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Order Total: <span className="font-bold text-gray-900 dark:text-white">${Number(order.total_amount).toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}

export default function ActiveDeliveriesPage() {
  const { assignments, assignmentsLoading, loadAssignments } = useDriverStore();

  const refresh = useCallback(() => { loadAssignments(); }, [loadAssignments]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <DriverPageWrapper
      title="Active Deliveries"
      subtitle="Manage and update your current delivery assignments."
      actions={
        <button onClick={refresh} disabled={assignmentsLoading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
          <RefreshCw className={cn("w-4 h-4", assignmentsLoading && "animate-spin")} />
        </button>
      }
    >
      {assignmentsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No active deliveries"
          description="Your assigned deliveries will appear here once you are online and have accepted requests."
          icon={<Truck className="h-12 w-12" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((order) => (
            <DeliveryCard key={order.id} order={order} onRefresh={refresh} />
          ))}
        </div>
      )}
    </DriverPageWrapper>
  );
}

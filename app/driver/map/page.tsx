"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDriverStore } from "@/stores/driver-store";
import { fetchDriverAssignments, type DriverOrder } from "@/lib/api/driver";
import { DriverPageWrapper } from "@/components/driver/DriverPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  MapPin, Navigation, RefreshCw, Truck, Package,
  Locate, AlertCircle, CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GpsState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  timestamp: number | null;
  error: string | null;
  tracking: boolean;
}

// ─── GPS Hook ─────────────────────────────────────────────────────────────────

function useGps(onLocation: (lat: number, lng: number) => void) {
  const [gps, setGps] = useState<GpsState>({
    lat: null, lng: null, accuracy: null, timestamp: null, error: null, tracking: false,
  });
  const watchId = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGps((prev) => ({ ...prev, error: "Geolocation not supported by your browser." }));
      return;
    }
    setGps((prev) => ({ ...prev, tracking: true, error: null }));
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGps({ lat: latitude, lng: longitude, accuracy, timestamp: pos.timestamp, error: null, tracking: true });
        onLocation(latitude, longitude);
      },
      (err) => {
        setGps((prev) => ({ ...prev, error: err.message, tracking: false }));
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 }
    );
  }, [onLocation]);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setGps((prev) => ({ ...prev, tracking: false }));
  }, []);

  useEffect(() => () => { if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current); }, []);

  return { gps, startTracking, stopTracking };
}

// ─── Order Location Card ──────────────────────────────────────────────────────

function OrderLocationCard({ order }: { order: DriverOrder }) {
  const addr = order.shipping_address;
  const lastTrack = order.tracking_history?.[0];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900 dark:text-white">Order #{order.id}</p>
        <StatusBadge status={order.status} />
      </div>
      {addr && (
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
          <MapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
          <span>{[addr.street_address, addr.city, addr.state, addr.country].filter(Boolean).join(", ")}</span>
        </div>
      )}
      {addr?.latitude && addr?.longitude && (
        <a
          href={`https://maps.google.com/?q=${addr.latitude},${addr.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          Open in Google Maps
        </a>
      )}
      {lastTrack && (
        <p className="text-xs text-gray-400">
          Last update: {lastTrack.status.replace(/_/g, " ")} — {new Date(lastTrack.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LiveMapPage() {
  const { profile, pushLocation } = useDriverStore();
  const [assignments, setAssignments] = useState<DriverOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [pushCount, setPushCount] = useState(0);

  const handleNewLocation = useCallback(
    async (lat: number, lng: number) => {
      await pushLocation(lat, lng);
      setPushCount((c) => c + 1);
    },
    [pushLocation]
  );

  const { gps, startTracking, stopTracking } = useGps(handleNewLocation);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const all = await fetchDriverAssignments();
      setAssignments(all);
    } catch {
      setAssignments([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const toggleTracking = () => {
    if (gps.tracking) {
      stopTracking();
      toast.info("Location tracking stopped.");
    } else {
      startTracking();
      toast.success("Location tracking started.");
    }
  };

  const hasLocation = gps.lat !== null && gps.lng !== null;

  return (
    <DriverPageWrapper
      title="Live Map & Tracking"
      subtitle="Share your location and navigate to delivery addresses."
      actions={
        <button
          onClick={loadOrders}
          disabled={loadingOrders}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", loadingOrders && "animate-spin")} />
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPS Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Location status card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Locate className="w-4 h-4 text-blue-500" />Your Location
            </h3>

            {gps.error && (
              <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800/30">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-400">{gps.error}</p>
              </div>
            )}

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <span className={cn(
                  "flex items-center gap-1.5 font-semibold text-xs px-2.5 py-1 rounded-full",
                  gps.tracking
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", gps.tracking ? "bg-green-500 animate-pulse" : "bg-gray-400")} />
                  {gps.tracking ? "Tracking" : "Stopped"}
                </span>
              </div>

              {hasLocation && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Latitude</span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">{gps.lat?.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Longitude</span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">{gps.lng?.toFixed(6)}</span>
                  </div>
                  {gps.accuracy && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Accuracy</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300">±{Math.round(gps.accuracy)}m</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Pushes sent</span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{pushCount}</span>
                  </div>
                </>
              )}

              {profile?.latitude && !hasLocation && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Last known lat</span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">{profile.latitude}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Last known lng</span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">{profile.longitude}</span>
                  </div>
                  {profile.location_updated_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Updated at</span>
                      <span className="text-xs text-gray-500">{new Date(profile.location_updated_at).toLocaleTimeString()}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              onClick={toggleTracking}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors",
                gps.tracking
                  ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {gps.tracking ? (
                <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />Stop Sharing Location</>
              ) : (
                <><Locate className="w-4 h-4" />Start Sharing Location</>
              )}
            </button>

            {hasLocation && (
              <a
                href={`https://maps.google.com/?q=${gps.lat},${gps.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Navigation className="w-4 h-4" />View on Google Maps
              </a>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30 p-4">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">How it works</p>
            <ul className="space-y-1.5 text-xs text-blue-800 dark:text-blue-300">
              {[
                "Click 'Start Sharing' to enable live GPS",
                "Your location is sent to the server every few seconds",
                "Customers and admins can track your position",
                "Location sharing stops when you click Stop or leave the page",
              ].map((t) => (
                <li key={t} className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Map embed + active orders */}
        <div className="lg:col-span-2 space-y-4">
          {/* Map embed */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />Delivery Map
              </h3>
            </div>
            {hasLocation ? (
              <iframe
                title="Driver Location Map"
                width="100%"
                height="360"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${gps.lat},${gps.lng}&z=15&output=embed`}
              />
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center p-8">
                <MapPin className="w-12 h-12 text-gray-200 dark:text-gray-700 mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Map will appear once location sharing is active</p>
                <p className="text-xs text-gray-400 mt-1">Click "Start Sharing Location" to begin</p>
              </div>
            )}
          </div>

          {/* Active delivery locations */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5" />Active Delivery Addresses
            </h3>
            {loadingOrders ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2].map((i) => <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />)}
              </div>
            ) : assignments.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
                <Package className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No active deliveries to display</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {assignments.map((order) => <OrderLocationCard key={order.id} order={order} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </DriverPageWrapper>
  );
}

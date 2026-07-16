"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDriverStore } from "@/stores/driver-store";
import { updateLocation } from "@/lib/api/driver";
import { DriverPageWrapper } from "@/components/driver/DriverPageWrapper";
import {
  MapPin, Locate, RefreshCw, CheckCircle, AlertCircle,
  Navigation, Clock, Wifi, WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GpsCoords {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export default function LocationPage() {
  const { profile, loadProfile } = useDriverStore();
  const [coords, setCoords] = useState<GpsCoords | null>(null);
  const [tracking, setTracking] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [lastPush, setLastPush] = useState<Date | null>(null);
  const [pushCount, setPushCount] = useState(0);
  const [pushing, setPushing] = useState(false);
  const watchId = useRef<number | null>(null);
  const pushInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Push GPS to backend every 15 seconds while tracking
  const pushToBackend = useCallback(async (lat: number, lng: number) => {
    if (pushing) return;
    setPushing(true);
    try {
      await updateLocation(lat, lng);
      setLastPush(new Date());
      setPushCount((c) => c + 1);
    } catch {
      // silent — best effort
    } finally {
      setPushing(false);
    }
  }, [pushing]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsError(null);
    setTracking(true);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords({ lat: latitude, lng: longitude, accuracy, timestamp: pos.timestamp });
      },
      (err) => {
        setGpsError(err.message);
        setTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 }
    );

    // Push to backend every 15 seconds
    pushInterval.current = setInterval(() => {
      setCoords((current) => {
        if (current) pushToBackend(current.lat, current.lng);
        return current;
      });
    }, 15_000);

    toast.success("GPS tracking started — your location is being shared.");
  }, [pushToBackend]);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (pushInterval.current !== null) {
      clearInterval(pushInterval.current);
      pushInterval.current = null;
    }
    setTracking(false);
    toast.info("Location tracking stopped.");
  }, []);

  // Manual one-time push
  const pushNow = useCallback(async () => {
    if (!coords) {
      toast.error("No location data — start tracking first.");
      return;
    }
    await pushToBackend(coords.lat, coords.lng);
    toast.success("Location pushed to server.");
  }, [coords, pushToBackend]);

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (pushInterval.current !== null) clearInterval(pushInterval.current);
    };
  }, []);

  const savedLat = profile?.latitude;
  const savedLng = profile?.longitude;
  const savedAt = profile?.location_updated_at;

  return (
    <DriverPageWrapper
      title="My Location"
      subtitle="Manage your GPS location for delivery assignments."
      actions={
        <button
          onClick={() => loadProfile()}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          title="Refresh saved location"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — GPS controls */}
        <div className="space-y-4">

          {/* Status card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Locate className="w-4 h-4 text-blue-500" />GPS Status
            </h3>

            {/* Live tracking badge */}
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl mb-4 border",
              tracking
                ? "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30"
                : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700"
            )}>
              {tracking ? (
                <Wifi className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <WifiOff className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
              <div>
                <p className={cn("text-sm font-semibold", tracking ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400")}>
                  {tracking ? "Live tracking active" : "Tracking inactive"}
                </p>
                <p className="text-xs text-gray-400">
                  {tracking ? "Location updates every 15 seconds" : "Start tracking to share your position"}
                </p>
              </div>
              {tracking && (
                <span className="ml-auto w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
              )}
            </div>

            {/* Error */}
            {gpsError && (
              <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800/30">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-400">{gpsError}</p>
              </div>
            )}

            {/* Current coords */}
            {coords && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Latitude", value: coords.lat.toFixed(7) },
                  { label: "Longitude", value: coords.lng.toFixed(7) },
                  { label: "Accuracy", value: `±${Math.round(coords.accuracy)}m` },
                  { label: "Updates sent", value: String(pushCount) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {lastPush && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                <Clock className="w-3.5 h-3.5" />
                Last push: {lastPush.toLocaleTimeString()}
              </div>
            )}

            {/* Toggle button */}
            <button
              onClick={tracking ? stopTracking : startTracking}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors",
                tracking
                  ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {tracking ? (
                <><WifiOff className="w-4 h-4" />Stop Sharing Location</>
              ) : (
                <><Locate className="w-4 h-4" />Start Sharing Location</>
              )}
            </button>

            {/* Manual push */}
            {coords && !tracking && (
              <button
                onClick={pushNow}
                disabled={pushing}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Navigation className="w-4 h-4" />
                {pushing ? "Pushing..." : "Push Location Once"}
              </button>
            )}
          </div>

          {/* Saved location card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-500" />Last Saved Location
            </h3>
            {savedLat && savedLng ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Latitude</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{savedLat}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Longitude</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{savedLng}</p>
                  </div>
                </div>
                {savedAt && (
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Saved: {new Date(savedAt).toLocaleString()}
                  </p>
                )}
                <a
                  href={`https://maps.google.com/?q=${savedLat},${savedLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  View on Google Maps
                </a>
              </div>
            ) : (
              <div className="text-center py-4">
                <MapPin className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No saved location yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Start tracking to save your position</p>
              </div>
            )}
          </div>
        </div>

        {/* Right — Map + tips */}
        <div className="space-y-4">
          {/* Map preview */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />Live Position
              </h3>
            </div>
            {coords ? (
              <iframe
                title="Current Position"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
              />
            ) : savedLat && savedLng ? (
              <iframe
                title="Last Saved Position"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${savedLat},${savedLng}&z=14&output=embed`}
              />
            ) : (
              <div className="h-60 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <MapPin className="w-10 h-10 text-gray-200 dark:text-gray-700" />
                <p className="text-sm text-gray-400">Enable tracking to see your live map</p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />Location Tips
            </h3>
            <ul className="space-y-2.5">
              {[
                { tip: "Enable location sharing when you start your shift", detail: "This helps get better order assignments." },
                { tip: "Keep the app open while delivering", detail: "Location updates stop when you close the app." },
                { tip: "High accuracy mode uses more battery", detail: "Make sure your phone is charged during shifts." },
                { tip: "Your location is only visible during active deliveries", detail: "Privacy is protected when you are offline." },
              ].map(({ tip, detail }) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{tip}</p>
                    <p className="text-xs text-gray-400">{detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DriverPageWrapper>
  );
}

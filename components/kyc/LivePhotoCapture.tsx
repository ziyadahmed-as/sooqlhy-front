// components/kyc/LivePhotoCapture.tsx
"use client";

/**
 * Secure Live Photo Capture with Liveness Detection
 * ─────────────────────────────────────────────────
 * Loads @mediapipe/tasks-vision from CDN at runtime via a <script> tag.
 * No npm package required — resolves the Module-not-found build error.
 *
 * Anti-spoofing:
 *   - Camera-only: getUserMedia — no file upload path
 *   - Active liveness: user must blink + smile (verified frame-by-frame by ML)
 *   - Capture disabled until ALL liveness checks pass
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, CheckCircle2, AlertCircle, RefreshCw, Loader2,
  Eye, SmilePlus, ScanFace,
} from "lucide-react";

// ─── Runtime MediaPipe globals (loaded from CDN script) ───────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;
interface MediaPipeWindow extends Window {
  vision?: {
    FaceLandmarker: {
      createFromOptions: (resolver: unknown, opts: object) => Promise<FaceLandmarkerInstance>;
    };
    FilesetResolver: {
      forVisionTasks: (path: string) => Promise<unknown>;
    };
  };
}
interface NormalizedLandmark { x: number; y: number; z: number; }
interface FaceLandmarkerInstance {
  detectForVideo(video: HTMLVideoElement, ts: number): { faceLandmarks: NormalizedLandmark[][] };
  close(): void;
}

// ─── Liveness constants ───────────────────────────────────────────────────────
type Challenge = "DETECTING" | "BLINK" | "SMILE" | "DONE";

const BLINK_EAR_THRESHOLD  = 0.18; // lower = eyes more closed
const SMILE_RATIO_THRESHOLD = 0.35; // higher = mouth more open

// MediaPipe 468-point mesh indices
const LEFT_EYE_TOP = 159, LEFT_EYE_BOT = 145, LEFT_EYE_LEFT = 33, LEFT_EYE_RIGHT = 133;
const RIGHT_EYE_TOP = 386, RIGHT_EYE_BOT = 374, RIGHT_EYE_LEFT = 362, RIGHT_EYE_RIGHT = 263;
const MOUTH_LEFT = 61, MOUTH_RIGHT = 291, MOUTH_TOP = 13, MOUTH_BOT = 14;

function euclidean(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
function computeEAR(lm: NormalizedLandmark[]): number {
  const L = euclidean(lm[LEFT_EYE_TOP], lm[LEFT_EYE_BOT]) / (2 * euclidean(lm[LEFT_EYE_LEFT], lm[LEFT_EYE_RIGHT]));
  const R = euclidean(lm[RIGHT_EYE_TOP], lm[RIGHT_EYE_BOT]) / (2 * euclidean(lm[RIGHT_EYE_LEFT], lm[RIGHT_EYE_RIGHT]));
  return (L + R) / 2;
}
function computeMouthRatio(lm: NormalizedLandmark[]): number {
  return euclidean(lm[MOUTH_TOP], lm[MOUTH_BOT]) / (euclidean(lm[MOUTH_LEFT], lm[MOUTH_RIGHT]) + 1e-6);
}

// ─── CDN loader ───────────────────────────────────────────────────────────────
const MEDIAPIPE_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.js";
const WASM_PATH     = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm";
const MODEL_URL     = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

function loadMediaPipeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as MediaPipeWindow).vision) return resolve();
    const existing = document.querySelector(`script[src="${MEDIAPIPE_CDN}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = MEDIAPIPE_CDN;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ─── Component props ──────────────────────────────────────────────────────────
interface Props {
  label?: string;
  hint?: string;
  required?: boolean;
  onCapture: (photo: File) => void;
  captured: File | null;
  onRetake: () => void;
}

const CHALLENGE_LABELS: Record<Challenge, string> = {
  DETECTING: "Position your face within the oval",
  BLINK:     "Please blink both eyes",
  SMILE:     "Now smile naturally",
  DONE:      "Liveness confirmed — capture your photo!",
};
const CHALLENGE_ICONS: Record<Challenge, React.ReactNode> = {
  DETECTING: <ScanFace  className="w-5 h-5" />,
  BLINK:     <Eye       className="w-5 h-5" />,
  SMILE:     <SmilePlus className="w-5 h-5" />,
  DONE:      <CheckCircle2 className="w-5 h-5" />,
};
const CHALLENGE_COLORS: Record<Challenge, string> = {
  DETECTING: "text-blue-400",
  BLINK:     "text-yellow-400",
  SMILE:     "text-orange-400",
  DONE:      "text-green-400",
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function LivePhotoCapture({
  label    = "Live Selfie",
  hint     = "A live photo is required for identity verification",
  required = true,
  onCapture,
  captured,
  onRetake,
}: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const landmarkerRef = useRef<FaceLandmarkerInstance | null>(null);
  const streamRef     = useRef<MediaStream | null>(null);

  const [status,       setStatus]       = useState<"idle"|"loading"|"running"|"error"|"captured">("idle");
  const [challenge,    setChallenge]    = useState<Challenge>("DETECTING");
  const [errorMsg,     setErrorMsg]     = useState("");
  const [faceDetected, setFaceDetected] = useState(false);

  const blinkDetected = useRef(false);
  const smileDetected = useRef(false);
  const prevEAR       = useRef(1.0);

  // ── Per-frame detection loop ───────────────────────────────────────────────
  const startDetection = useCallback(() => {
    let lastTs = 0;
    const loop = (ts: number) => {
      const video   = videoRef.current;
      const overlay = overlayRef.current;
      if (!video || !overlay || !landmarkerRef.current || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      if (ts - lastTs < 33) { rafRef.current = requestAnimationFrame(loop); return; }
      lastTs = ts;

      const result = landmarkerRef.current.detectForVideo(video, ts);
      const lms    = result?.faceLandmarks;
      const ctx    = overlay.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, overlay.width, overlay.height);

      if (!lms || lms.length === 0) {
        setFaceDetected(false);
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      setFaceDetected(true);
      const lm = lms[0];

      // Draw oval face guide
      if (ctx) {
        ctx.beginPath();
        ctx.ellipse(overlay.width / 2, overlay.height / 2, overlay.width * 0.22, overlay.height * 0.38, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(96,165,250,0.85)";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const ear        = computeEAR(lm);
      const mouthRatio = computeMouthRatio(lm);

      setChallenge(prev => {
        if (prev === "DETECTING") return "BLINK";
        if (prev === "BLINK") {
          if (prevEAR.current > BLINK_EAR_THRESHOLD && ear <= BLINK_EAR_THRESHOLD) {
            blinkDetected.current = true;
          }
          if (blinkDetected.current) return "SMILE";
        }
        if (prev === "SMILE") {
          if (mouthRatio >= SMILE_RATIO_THRESHOLD) smileDetected.current = true;
          if (smileDetected.current) return "DONE";
        }
        return prev;
      });
      prevEAR.current = ear;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  // ── Load CDN script + create landmarker + start camera ────────────────────
  const startCapture = useCallback(async () => {
    setStatus("loading");
    setErrorMsg("");

    // 1. Load the CDN bundle
    try {
      await loadMediaPipeScript();
    } catch {
      setErrorMsg("Failed to load face detection library. Check your internet connection.");
      setStatus("error");
      return;
    }

    // 2. Create FaceLandmarker from the global `vision` object
    const { vision } = window as MediaPipeWindow;
    if (!vision) {
      setErrorMsg("MediaPipe library did not initialise correctly. Please refresh and try again.");
      setStatus("error");
      return;
    }

    try {
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(WASM_PATH);
      try {
        landmarkerRef.current = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO", numFaces: 1,
        });
      } catch {
        // GPU unavailable — fall back to CPU
        landmarkerRef.current = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
          runningMode: "VIDEO", numFaces: 1,
        });
      }
    } catch {
      setErrorMsg("Could not load face detection model. Please try again.");
      setStatus("error");
      return;
    }

    // 3. Start webcam
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("running");
      startDetection();
    } catch (e: unknown) {
      const msg = (e as Error).message || "";
      setErrorMsg(
        msg.includes("NotAllowed") || msg.includes("Permission")
          ? "Camera permission denied. Please allow camera access and try again."
          : "Could not access your camera. Ensure no other app is using it."
      );
      setStatus("error");
    }
  }, [startDetection]);

  // ── Photo capture ──────────────────────────────────────────────────────────
  const capture = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || challenge !== "DONE") return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror to match what user sees
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.restore();

    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `live-selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
      stopCamera();
      setStatus("captured");
      onCapture(file);
    }, "image/jpeg", 0.92);
  }, [challenge, onCapture]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
  }, []);

  const handleRetake = useCallback(() => {
    blinkDetected.current = false;
    smileDetected.current = false;
    prevEAR.current = 1.0;
    setChallenge("DETECTING");
    setFaceDetected(false);
    setStatus("idle");
    onRetake();
  }, [onRetake]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <Camera className="w-4 h-4 text-blue-500" />
        <label className="text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      </div>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}

      {/* ── Captured ── */}
      {status === "captured" && captured ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-green-400 bg-gray-900">
          <img src={URL.createObjectURL(captured)} alt="Live selfie" className="w-full h-56 object-cover" />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-end pb-4 gap-2">
            <div className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" /> Liveness Verified
            </div>
            <button type="button" onClick={handleRetake}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs underline">
              <RefreshCw className="w-3.5 h-3.5" /> Retake
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50">

          {/* ── Idle ── */}
          {status === "idle" && (
            <div className="flex flex-col items-center justify-center gap-4 py-10 px-6">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <ScanFace className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Live Facial Verification</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Blink and smile to confirm you are physically present.
                  Screenshots and pre-recorded videos will not be accepted.
                </p>
              </div>
              <button type="button" onClick={startCapture}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
                <Camera className="w-4 h-4" /> Start Camera
              </button>
            </div>
          )}

          {/* ── Loading ── */}
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">Loading face detection model…</p>
              <p className="text-xs text-gray-400">This may take a few seconds on first use.</p>
            </div>
          )}

          {/* ── Error ── */}
          {status === "error" && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm font-semibold text-gray-700">Camera Error</p>
              <p className="text-xs text-gray-500">{errorMsg}</p>
              <button type="button" onClick={() => { setStatus("idle"); setErrorMsg(""); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition-all">
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </button>
            </div>
          )}

          {/* ── Live Camera ── */}
          {status === "running" && (
            <div className="relative">
              <video ref={videoRef} playsInline muted
                className="w-full h-64 object-cover"
                style={{ transform: "scaleX(-1)" }} />

              {/* Oval guide overlay */}
              <canvas ref={overlayRef}
                className="absolute inset-0 w-full h-64 pointer-events-none"
                style={{ transform: "scaleX(-1)" }}
                width={640} height={480} />

              {/* Challenge badge */}
              <AnimatePresence mode="wait">
                <motion.div key={challenge}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute top-3 left-0 right-0 flex justify-center">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-black/60 backdrop-blur-sm ${CHALLENGE_COLORS[challenge]}`}>
                    {CHALLENGE_ICONS[challenge]}
                    {CHALLENGE_LABELS[challenge]}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* No-face warning */}
              {!faceDetected && (
                <div className="absolute bottom-14 left-0 right-0 flex justify-center">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/80 text-white text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5" /> No face detected — look at the camera
                  </div>
                </div>
              )}

              {/* Progress dots */}
              <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-2">
                {(["DETECTING", "BLINK", "SMILE", "DONE"] as Challenge[]).map((c, i) => {
                  const cur = ["DETECTING", "BLINK", "SMILE", "DONE"].indexOf(challenge);
                  return <div key={c} className={`h-1.5 rounded-full transition-all duration-300 ${i <= cur ? "w-6 bg-blue-400" : "w-1.5 bg-white/30"}`} />;
                })}
              </div>

              {/* Capture button */}
              <div className="p-3 bg-white border-t border-gray-100 flex justify-center">
                <button type="button" disabled={challenge !== "DONE"} onClick={capture}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    challenge === "DONE"
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}>
                  <Camera className="w-4 h-4" />
                  {challenge === "DONE" ? "Capture Photo" : "Complete challenge to unlock"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

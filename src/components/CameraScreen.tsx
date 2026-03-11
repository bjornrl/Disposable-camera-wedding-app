"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { FILTERS, FilterDef } from "@/lib/filters";
import { uploadPhoto } from "@/lib/upload";
import { incrementPhotoCount } from "@/lib/guests";

const MAX_PHOTOS = 10;

interface Props {
  guestName: string;
  initialPhotoCount?: number;
  adminMode?: boolean;
}

export default function CameraScreen({
  guestName,
  initialPhotoCount = 0,
  adminMode = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [started, setStarted] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [filter, setFilter] = useState<FilterDef>(FILTERS[0]);
  const [photosTaken, setPhotosTaken] = useState(initialPhotoCount);
  const [flash, setFlash] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const startCamera = useCallback(
    async (facing: "environment" | "user") => {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStarted(true);
        setError(null);
      } catch {
        setError("Kunne ikke åpne kameraet. Sjekk tillatelsene.");
      }
    },
    []
  );

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flipCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  };

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (!adminMode && photosTaken >= MAX_PHOTOS) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply filter
    ctx.filter = filter.canvasFilter;
    ctx.drawImage(video, 0, 0);

    // Apply overlay if present
    if (filter.overlay) {
      ctx.filter = "none";
      ctx.fillStyle = filter.overlay;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Add subtle vignette
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.3,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.75
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.3)");
    ctx.filter = "none";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.85);
    });

    const newCount = photosTaken + 1;
    setPhotosTaken(newCount);

    // Show preview
    const previewUrl = URL.createObjectURL(blob);
    setLastPhoto(previewUrl);

    // Upload to storage + increment DB count
    setUploading(true);
    try {
      await uploadPhoto(blob, guestName, newCount);
      const dbCount = await incrementPhotoCount(guestName);
      setPhotosTaken(dbCount);

      if (!adminMode && dbCount >= MAX_PHOTOS) {
        setDone(true);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
      }
    } catch {
      setError("Opplasting feilet. Bildet blir forsøkt på nytt.");
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-stone-900 text-stone-100 px-6 text-center">
        <div className="text-5xl mb-6">📸</div>
        <h2 className="text-2xl font-serif mb-3">Alle bilder er brukt!</h2>
        <p className="text-stone-400 max-w-xs">
          Takk, {guestName}! Dine {MAX_PHOTOS} bilder er lastet opp. Brudeparet
          vil elske dem!
        </p>
        {lastPhoto && (
          <img
            src={lastPhoto}
            alt="Siste bilde"
            className="mt-6 rounded-lg w-48 h-48 object-cover border-2 border-stone-700"
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col relative overflow-hidden select-none">
      {/* Flash overlay */}
      {flash && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-flash" />
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Admin badge */}
      {adminMode && (
        <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
          ADMIN
        </div>
      )}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/60">
        <span className="text-stone-300 text-xs font-mono">{guestName}</span>
        <span className="text-amber-400 text-xs font-mono tracking-wider">
          {photosTaken}/{MAX_PHOTOS}
        </span>
        <button
          onClick={flipCamera}
          className="text-stone-300 p-1"
          aria-label="Bytt kamera"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
            <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
            <circle cx="12" cy="12" r="3" />
            <path d="m18 22-3-3 3-3" />
            <path d="m6 2 3 3-3 3" />
          </svg>
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: filter.css,
            transform: facingMode === "user" ? "scaleX(-1)" : undefined,
          }}
        />
        {/* Film border overlay */}
        <div className="absolute inset-0 pointer-events-none border-[3px] border-stone-800/40 rounded-sm" />

        {/* Timestamp watermark */}
        <div className="absolute bottom-3 right-3 text-amber-500/60 text-[10px] font-mono pointer-events-none">
          {new Date().toLocaleDateString("no-NB")} &middot; B&E
        </div>

        {/* Upload indicator */}
        {uploading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-amber-400 text-xs px-3 py-1 rounded-full font-mono">
            Laster opp...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-200 text-xs px-3 py-1 rounded-full">
            {error}
          </div>
        )}
      </div>

      {/* Filter strip */}
      <div className="bg-black/80 py-2 px-3 overflow-x-auto">
        <div className="flex gap-2 justify-center">
          {FILTERS.map((f) => (
            <button
              key={f.name}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                filter.name === f.name
                  ? "bg-amber-600 text-white"
                  : "bg-stone-800 text-stone-400 hover:bg-stone-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shutter area */}
      <div className="bg-black py-5 flex items-center justify-center gap-6">
        {/* Last photo thumbnail */}
        <div className="w-12 h-12 rounded-md overflow-hidden border border-stone-700">
          {lastPhoto ? (
            <img
              src={lastPhoto}
              alt="Siste"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-stone-800" />
          )}
        </div>

        {/* Shutter button */}
        <button
          onClick={takePhoto}
          disabled={!started || (!adminMode && photosTaken >= MAX_PHOTOS)}
          className="w-[72px] h-[72px] rounded-full border-4 border-stone-300 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-30"
          aria-label="Ta bilde"
        >
          <div className="w-[58px] h-[58px] rounded-full bg-stone-100 hover:bg-white transition-colors" />
        </button>

        {/* Remaining counter */}
        <div className="w-12 h-12 flex items-center justify-center">
          <span className="text-stone-500 text-xs font-mono">
            {MAX_PHOTOS - photosTaken} igjen
          </span>
        </div>
      </div>
    </div>
  );
}

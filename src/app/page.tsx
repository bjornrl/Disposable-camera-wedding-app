"use client";

import { useState, useEffect } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import CameraScreen from "@/components/CameraScreen";
import { getCookie, setCookie } from "@/lib/cookies";
import { getGuest, createOrGetGuest } from "@/lib/guests";

const MAX_PHOTOS = 10;
const COOKIE_NAME = "wedding_guest_name";

export default function Home() {
  const [guestName, setGuestName] = useState<string | null>(null);
  const [initialCount, setInitialCount] = useState(0);
  const [allUsed, setAllUsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);

  // Check cookie + admin param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true") {
      setAdminMode(true);
    }

    const savedName = getCookie(COOKIE_NAME);
    if (savedName) {
      getGuest(savedName).then((guest) => {
        if (guest) {
          const isAdmin = params.get("admin") === "true";
          if (guest.photos_taken >= MAX_PHOTOS && !isAdmin) {
            setGuestName(savedName);
            setInitialCount(guest.photos_taken);
            setAllUsed(true);
          } else {
            setGuestName(savedName);
            setInitialCount(guest.photos_taken);
          }
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleStart = async (name: string) => {
    const guest = await createOrGetGuest(name);
    setCookie(COOKIE_NAME, name, 7);

    if (guest.photos_taken >= MAX_PHOTOS && !adminMode) {
      setGuestName(name);
      setInitialCount(guest.photos_taken);
      setAllUsed(true);
      return;
    }

    setGuestName(name);
    setInitialCount(guest.photos_taken);
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-stone-900 text-stone-400">
        <div className="text-sm font-mono">Laster...</div>
      </div>
    );
  }

  if (allUsed && guestName) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-stone-900 text-stone-100 px-6 text-center">
        <div className="text-5xl mb-6">📸</div>
        <h2 className="text-2xl font-serif mb-3">Alle bilder er brukt!</h2>
        <p className="text-stone-400 max-w-xs">
          Du har allerede brukt alle bildene dine! Takk, {guestName}.
        </p>
      </div>
    );
  }

  if (!guestName) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <CameraScreen
      guestName={guestName}
      initialPhotoCount={initialCount}
      adminMode={adminMode}
    />
  );
}

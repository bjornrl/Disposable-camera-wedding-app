"use client";

import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import CameraScreen from "@/components/CameraScreen";

export default function Home() {
  const [guestName, setGuestName] = useState<string | null>(null);

  if (!guestName) {
    return <WelcomeScreen onStart={setGuestName} />;
  }

  return <CameraScreen guestName={guestName} />;
}

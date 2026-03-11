"use client";

import { useState } from "react";

interface Props {
  onStart: (name: string) => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onStart(trimmed);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-stone-900 text-stone-100 px-6">
      <div className="text-center mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-400 mb-2">
          Bryllupet til
        </p>
        <h1 className="text-4xl font-serif font-light tracking-wide">
          Brita & Espen
        </h1>
        <div className="mt-3 w-16 h-px bg-stone-500 mx-auto" />
        <p className="mt-4 text-stone-400 text-sm">
          Engangskamera &middot; 10 bilder
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div>
          <label
            htmlFor="guest-name"
            className="block text-xs uppercase tracking-wider text-stone-400 mb-2"
          >
            Ditt navn
          </label>
          <input
            id="guest-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Skriv navnet ditt"
            autoComplete="name"
            className="w-full bg-stone-800 border border-stone-600 rounded-lg px-4 py-3 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-3 rounded-lg bg-amber-600 text-white font-medium tracking-wide transition-colors hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Åpne kamera
        </button>
      </form>

      <p className="mt-8 text-xs text-stone-500 text-center max-w-xs">
        Ta bilder fra festen! Bildene dine lastes opp automatisk til
        brudeparet.
      </p>
    </div>
  );
}

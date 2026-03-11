"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Photo {
  name: string;
  url: string;
  guest: string;
  created: string;
}

const BUCKET = "wedding-photos";

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Photo | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  async function loadPhotos() {
    setLoading(true);
    try {
      // List all guest folders
      const { data: folders } = await supabase.storage
        .from(BUCKET)
        .list("", { limit: 200 });

      if (!folders) return;

      const allPhotos: Photo[] = [];

      for (const folder of folders) {
        if (!folder.id) {
          // It's a folder
          const { data: files } = await supabase.storage
            .from(BUCKET)
            .list(folder.name, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

          if (files) {
            for (const file of files) {
              if (file.name.endsWith(".jpg")) {
                const { data } = supabase.storage
                  .from(BUCKET)
                  .getPublicUrl(`${folder.name}/${file.name}`);

                allPhotos.push({
                  name: file.name,
                  url: data.publicUrl,
                  guest: folder.name.replace(/-/g, " "),
                  created: file.created_at || "",
                });
              }
            }
          }
        }
      }

      // Sort newest first
      allPhotos.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      );
      setPhotos(allPhotos);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-stone-900 text-stone-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-stone-900/90 backdrop-blur border-b border-stone-800 px-4 py-4">
        <h1 className="text-xl font-serif text-center">
          Brita & Espen – Bildegalleri
        </h1>
        <p className="text-xs text-stone-400 text-center mt-1">
          {photos.length} bilder
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-stone-400 text-sm">Laster bilder...</div>
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="text-4xl mb-4">📷</div>
          <p className="text-stone-400">Ingen bilder ennå!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 p-1">
          {photos.map((photo) => (
            <button
              key={photo.url}
              onClick={() => setSelected(photo)}
              className="relative aspect-square overflow-hidden group"
            >
              <img
                src={photo.url}
                alt={`Bilde av ${photo.guest}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white capitalize">{photo.guest}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setSelected(null)}
          >
            ✕
          </button>
          <img
            src={selected.url}
            alt={`Bilde av ${selected.guest}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
          <p className="mt-3 text-stone-400 text-sm capitalize">
            Av {selected.guest}
          </p>
        </div>
      )}
    </div>
  );
}

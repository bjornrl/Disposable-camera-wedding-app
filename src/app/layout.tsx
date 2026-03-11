import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brita & Espen – Bryllupskamera",
  description: "Digitalt engangskamera for bryllupet til Brita og Espen",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1c1917",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body className="bg-stone-900 text-stone-100 antialiased">
        {children}
      </body>
    </html>
  );
}

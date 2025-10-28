import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LordMagick.com",
  description: "Unlock Ancient Secrets. Master Your Craft.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cinzel.className}>
        {/* The children prop represents the transitioning pages from template.tsx */}
        {children}

        {/* UPDATED: Persistent Mist Video Overlay */}
        {/* Replaced the Image component with a Video component. */}
        <video
          src="/videos/mist-overlay.mp4" // Make sure this path is correct
          autoPlay
          loop
          muted
          playsInline // Essential for mobile browsers
          className="fixed bottom-0 left-0 w-full h-[25vh] z-50 pointer-events-none object-cover"
        />
      </body>
    </html>
  );
}
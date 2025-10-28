import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";
import Image from "next/image"; // Import the Image component

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
        {/* The children prop now represents the transitioning pages from template.tsx */}
        {children}

        {/* UPDATED: Persistent Mist Overlay */}
        {/* This element lives outside the page transitions, so it will always be visible. */}
        <div className="fixed bottom-0 left-0 w-full h-[25vh] z-50 pointer-events-none">
          <Image
            src="/videos/mist-overlay.mp4"
            alt="Mystical mist"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";
import BackgroundAudio from "./components/BackgroundAudio"; // NEW: Import the audio component

const cinzel = Cinzel({
  subsets: ["latin"],
  display: 'swap',
});

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
      <body className={`${cinzel.className} bg-black text-white antialiased`}>
        <BackgroundAudio /> {/* NEW: The drone sound now lives here, globally */}
        {children}
        
        {/* The mist overlay remains here */}
        <div className="mist-overlay fixed bottom-0 left-0 w-full h-2/5 bg-[url('/images/mist-overlay.png')] bg-repeat-x z-30 pointer-events-none opacity-[.10] animate-[flow-mist_45s_linear_infinite]" />
        <div className="mist-overlay fixed bottom-0 left-0 w-full h-2/5 bg-[url('/images/mist-overlay.png')] bg-repeat-x z-30 pointer-events-none opacity-[.10] animate-[flow-mist-crossfade_45s_linear_infinite]" />
      </body>
    </html>
  );
}
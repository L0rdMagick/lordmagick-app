import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import { ReactElement } from "react";
import "./globals.css";
import BackgroundAudio from "./components/BackgroundAudio";
import { NavMenuProvider } from "./context/NavMenuContext"; // THE FIX: Import the provider
import RoomsMenu from "./components/RoomsMenu"; // THE FIX: Import the new menu

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
}>): ReactElement {
  return (
    <html lang="en">
      <body className={`${cinzel.className} bg-black text-white antialiased`}>
        {/* THE FIX: Wrap the application in the NavMenuProvider */}
        <NavMenuProvider>
          <BackgroundAudio />
          {children}
          <RoomsMenu /> {/* THE FIX: Add the global menu component */}
        </NavMenuProvider>
        
        <div className="mist-overlay fixed bottom-0 left-0 w-full h-2/5 bg-[url('/images/mist-overlay.png')] bg-repeat-x z-30 pointer-events-none opacity-[.1] animate-[flow-mist_45s_linear_infinite]" />
        <div className="mist-overlay fixed bottom-0 left-0 w-full h-2/5 bg-[url('/images/mist-overlay.png')] bg-repeat-x z-30 pointer-events-none opacity-[.1] animate-[flow-mist-crossfade_45s_linear_infinite]" />
      </body>
    </html>
  );
}
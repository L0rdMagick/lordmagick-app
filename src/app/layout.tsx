// --- START OF FILE src/app/layout.tsx ---
import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import { ReactElement } from "react";
import "./globals.css";
import BackgroundAudio from "./components/BackgroundAudio";
import { NavMenuProvider } from "./context/NavMenuContext";
import RoomsMenu from "./components/RoomsMenu";

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
        <NavMenuProvider>
          <BackgroundAudio />
          {children}
          <RoomsMenu />
        </NavMenuProvider>
        
        {/* MIST OVERLAY CONTAINER */}
        {/* We apply opacity here (0.05) to act as a master filter. 
            Even if the child animation pulses opacity, it will never exceed this limit. */}
        <div 
          className="fixed bottom-0 left-0 w-full h-2/5 z-30 pointer-events-none mix-blend-screen"
          style={{ opacity: 0.25 }} 
        >
            <div className="absolute inset-0 w-full h-full bg-[url('/images/mist-overlay.png')] bg-repeat-x animate-[flow-mist_45s_linear_infinite]" />
            <div className="absolute inset-0 w-full h-full bg-[url('/images/mist-overlay.png')] bg-repeat-x animate-[flow-mist-crossfade_45s_linear_infinite]" />
        </div>
      </body>
    </html>
  );
}
// --- END OF FILE ---
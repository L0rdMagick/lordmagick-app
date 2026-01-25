// --- START OF FILE src/app/layout.tsx ---
import type { Metadata } from "next";
import { Cinzel, MedievalSharp } from "next/font/google";
import { ReactElement } from "react";
import "./globals.css";
import BackgroundAudio from "./components/BackgroundAudio";
import { NavMenuProvider } from "./context/NavMenuContext";
import RoomsMenu from "./components/RoomsMenu";

const cinzel = Cinzel({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-cinzel',
});

const medieval = MedievalSharp({
  weight: "400",
  subsets: ["latin"],
  variable: '--font-medieval',
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
      <body className={`${cinzel.variable} ${medieval.variable} font-sans bg-black text-white antialiased`}>
        <NavMenuProvider>
          <BackgroundAudio />
          {children}
          <RoomsMenu />
        </NavMenuProvider>
        
        {/* MIST OVERLAY CONTAINER */}
        <div 
          className="fixed bottom-0 left-0 w-full h-2/5 z-30 pointer-events-none mix-blend-screen"
          style={{ 
            // Master Opacity Control
            opacity: 0.2, 
            // CSS Mask to fade the top edge
            maskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)'
          }} 
        >
            <div className="absolute inset-0 w-full h-full bg-[url('/images/mist-overlay.png')] bg-repeat-x animate-[flow-mist_45s_linear_infinite]" />
            <div className="absolute inset-0 w-full h-full bg-[url('/images/mist-overlay.png')] bg-repeat-x animate-[flow-mist-crossfade_45s_linear_infinite]" />
        </div>
      </body>
    </html>
  );
}
// --- END OF FILE ---
import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";

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
        {children}

        {/* 
          THE OPACITY FIX: Changed both layers from opacity-30 to opacity-40
          to make the mist effect more prominent.
        */}

        {/* Bottom Layer (Always Visible) */}
        <div
          className="mist-overlay fixed bottom-0 left-0 w-full h-2/5 
                     bg-[url('/images/mist-overlay.png')] bg-repeat-x 
                     z-30 pointer-events-none opacity-40 
                     animate-[flow-mist_45s_linear_infinite]"
        />
        
        {/* Top Layer (Crossfades to hide the loop) */}
        <div
          className="mist-overlay fixed bottom-0 left-0 w-full h-2/5 
                     bg-[url('/images/mist-overlay.png')] bg-repeat-x 
                     z-30 pointer-events-none opacity-40 
                     animate-[flow-mist-crossfade_45s_linear_infinite]"
        />
      </body>
    </html>
  );
}
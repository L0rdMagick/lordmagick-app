import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";

// Initialize the font with 'variable' to use it easily with Tailwind if preferred,
// though direct application to body works too.
const cinzel = Cinzel({ 
  subsets: ["latin"],
  variable: '--font-cinzel',
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
      {/* 
        Apply the font className AND antialiasing for better text rendering.
        The text-white default helps prevent flashes of unstyled content colors.
      */}
      <body className={`${cinzel.className} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
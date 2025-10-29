import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";

// Initialize the font and assign it a CSS variable name.
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: '--font-cinzel', // This variable is used in tailwind.config.ts
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
        FIX: Added `font-cinzel` to the body's className.
        This explicitly applies the font family defined in your Tailwind config.
        The `cinzel.variable` makes the font available, and `font-cinzel` applies it.
      */}
      <body className={`${cinzel.variable} font-cinzel bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
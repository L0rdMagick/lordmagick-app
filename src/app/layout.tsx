import type { Metadata } from "next";
import { Cinzel } from "next/font/google"; // Correctly using Cinzel
import "./globals.css";

// Initialize the Cinzel font. We no longer need the 'variable' property.
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
      {/*
        THE FIX: We apply `cinzel.className` directly to the body.
        This is the most foolproof method to apply the font from next/font.
        It handles all the necessary CSS rules automatically.
      */}
      <body className={`${cinzel.className} bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
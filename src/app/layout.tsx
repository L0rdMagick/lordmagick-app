import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";

// Configure the Cinzel font
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
      {/* Applying the font's class name to the body makes it the default for the entire site */}
      <body className={cinzel.className}>{children}</body>
    </html>
  );
}
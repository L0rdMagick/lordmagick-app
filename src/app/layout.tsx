import type { Metadata } from "next";
// We are still importing the 'Cinzel' font from Google Fonts
import { Cinzel } from "next/font/google";
import "./globals.css";

// Configure the font. We're loading the 'latin' character set.
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
      {/* The body tag still has the custom font applied. */}
      {/* The video/image overlay code has been completely removed. */}
      <body className={cinzel.className}>{children}</body>
    </html>
  );
}
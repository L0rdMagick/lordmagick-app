import type { Metadata } from "next";
// Import the 'Cinzel' font from Google Fonts, which gives us the ancient look.
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
      {/* 
        This is the most important line. 
        We apply the font's generated class name to the body tag,
        making it the default font for the entire site.
      */}
      <body className={cinzel.className}>{children}</body>
    </html>
  );
}
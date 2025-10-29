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
        By applying the variable here, the `font-cinzel` utility class from our
        Tailwind config will now correctly apply the Cinzel font family.
      */}
      <body className={`${cinzel.variable} font-cinzel bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
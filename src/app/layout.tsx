// --- START OF FILE src/app/layout.tsx ---
import type { Metadata } from "next";
import { Cinzel, MedievalSharp, IM_Fell_English_SC, Playfair_Display, EB_Garamond, UnifrakturMaguntia } from "next/font/google";
import { ReactElement } from "react";
import "./globals.css";
import MusicPlayer from "./components/MusicPlayer";
import { NavMenuProvider } from "./context/NavMenuContext";
import { MusicPlayerProvider } from "./context/MusicPlayerContext";
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

const imFell = IM_Fell_English_SC({
  weight: "400",
  subsets: ["latin"],
  variable: '--font-im-fell',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-eb-garamond',
});

const unifraktur = UnifrakturMaguntia({
  weight: "400",
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-unifraktur',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lordmagick.com'),
  title: {
    default: 'LordMagick | Witchcraft Spells, Tarot & Psychic Training',
    template: '%s | LordMagick',
  },
  description: 'Unlocking ancient secrets for the modern mystic. Cast real spells online, receive AI tarot readings, and master witchcraft and psychic abilities in our online school.',
  keywords: ['Witchcraft', 'Magick', 'Spells', 'Tarot', 'Psychic Training', 'Occult', 'Esoteric', 'Grimoire', 'Online Altar', 'Digital Servitors', 'Wiccan Spells', 'Hoodoo Spells'],
  authors: [{ name: 'LordMagick' }],
  creator: 'LordMagick',
  publisher: 'LordMagick',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'LordMagick | Witchcraft Spells, Tarot & Psychic Training',
    description: 'Enter the Grand Hall to cast spells, consult the oracle, and train your psychic abilities. A complete digital platform for the modern witch.',
    url: 'https://lordmagick.com',
    siteName: 'LordMagick',
    images: [
      {
        url: '/images/grand-hall-bg.png',
        width: 1200,
        height: 630,
        alt: 'LordMagick Grand Hall',
      },
      {
        url: '/images/logo-lordmagick.com.png',
        width: 800,
        height: 800,
        alt: 'LordMagick Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LordMagick | Witchcraft Spells, Tarot & Psychic Training',
    description: 'Cast spells, learn magick, and master your psychic potential.',
    images: ['/images/grand-hall-bg.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://lordmagick.com',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://lordmagick.com/#website',
      'url': 'https://lordmagick.com',
      'name': 'LordMagick',
      'description': 'Online Witchcraft, Tarot, and Psychic Training Platform',
      'publisher': {
        '@id': 'https://lordmagick.com/#organization'
      }
    },
    {
      '@type': 'Organization',
      '@id': 'https://lordmagick.com/#organization',
      'name': 'LordMagick',
      'url': 'https://lordmagick.com',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://lordmagick.com/images/logo-lordmagick.com.png',
        'width': 500,
        'height': 500
      },
      'sameAs': [
        // Add social profiles here if available
      ]
    }
  ]
};

export default function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>): ReactElement {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${medieval.variable} ${imFell.variable} ${playfair.variable} ${ebGaramond.variable} ${unifraktur.variable} font-sans bg-black text-white antialiased`}>
        <NavMenuProvider>
          <MusicPlayerProvider>
            <MusicPlayer />
            {children}
            {modal}
            <RoomsMenu />
          </MusicPlayerProvider>
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
            <div className="absolute inset-0 w-full h-full bg-[url('/images/mist-overlay.png')] bg-repeat-x animate-[flow-mist-crossfade_45s_linear_infinite]" />
            <div className="absolute inset-0 w-full h-full bg-[url('/images/mist-overlay.png')] bg-repeat-x animate-[flow-mist-crossfade_45s_linear_infinite]" style={{ animationDelay: '-22.5s' }} />
        </div>
      {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
// --- END OF FILE ---
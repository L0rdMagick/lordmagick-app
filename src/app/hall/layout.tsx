import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Grand Hall | Gateway to Magick & Witchcraft',
  description: 'Enter the Grand Hall of LordMagick. Access the Spell Room, Oracle Chamber, Magick School, and Esoteric Shop. Your journey into the arcane begins here.',
  openGraph: {
    title: 'The Grand Hall | Gateway to Magick & Witchcraft',
    description: 'Enter the Grand Hall of LordMagick. Access the Spell Room, Oracle Chamber, Magick School, and Esoteric Shop.',
    url: 'https://lordmagick.com/hall',
    images: ['/images/grand-hall-bg.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

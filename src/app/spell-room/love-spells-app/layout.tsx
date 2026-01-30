import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Love Spells & Relationship Magick',
  description: 'Cast effective love spells and relationship magick. Attract new love, strengthen bonds, or perform self-love rituals.',
  keywords: ['Love Spells', 'Relationship Magick', 'Attract Love', 'Soulmate Spell', 'Rose Magick', 'Venus Rituals'],
  openGraph: {
    title: 'Love Spells & Relationship Magick',
    description: 'Cast effective love spells and relationship magick online.',
    url: 'https://lordmagick.com/spell-room/love-spells-app',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

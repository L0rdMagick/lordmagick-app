import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Magickal Tools & Esoteric Shop',
  description: 'Browse our collection of magickal tools, tarot decks, and energy work devices. Featuring Electro-Magickal Wands and rare digital artifacts.',
  keywords: ['Magickal Tools', 'Buy Tarot Decks', 'Witchcraft Supplies', 'Magic Wand', 'Esoteric Shop', 'Occult Store'],
  openGraph: {
    title: 'Magickal Tools & Esoteric Shop',
    description: 'Browse our collection of magickal tools, tarot decks, and energy work devices.',
    url: 'https://lordmagick.com/magickal-tools',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

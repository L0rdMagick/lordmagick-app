import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buy Tarot & Oracle Decks',
  description: 'Curated collection of Tarot and Oracle decks. Find the perfect deck to speak to your intuition.',
  keywords: ['Buy Tarot Deck', 'Oracle Cards', 'Tarot Shop', 'Rider Waite', 'Thoth Tarot'],
  openGraph: {
    title: 'Buy Tarot & Oracle Decks',
    description: 'Curated collection of Tarot and Oracle decks.',
    url: 'https://lordmagick.com/magickal-tools/tarot-decks',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

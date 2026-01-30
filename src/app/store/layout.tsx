import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Faestone Store | Purchase Credits',
  description: 'Acquire Faestones to unlock premium spells, advanced tarot readings, and digital servitors. Support your magickal practice.',
  openGraph: {
    title: 'Faestone Store | Purchase Credits',
    description: 'Acquire Faestones to unlock premium spells, advanced tarot readings, and digital servitors.',
    url: 'https://lordmagick.com/store',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Oracle Room | AI Tarot Readings & Divination',
  description: 'Enter the Oracle Room for accurate AI Tarot readings, Human Design analysis, and spiritual guidance. Consult the mystic forces for clarity on your path.',
  keywords: ['AI Tarot Reading', 'Free Tarot Reading', 'Human Design Chart', 'Oracle Reading', 'Divination Online', 'Psychic Reading'],
  openGraph: {
    title: 'Oracle Room | AI Tarot Readings & Divination',
    description: 'Enter the Oracle Room for accurate AI Tarot readings, Human Design analysis, and spiritual guidance.',
    url: 'https://lordmagick.com/oracle-room',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

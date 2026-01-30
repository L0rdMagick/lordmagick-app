import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Tarot Reading Online',
  description: 'Get an instant, accurate AI Tarot reading. Choose from Celtic Cross, Three Card Spread, and more. Detailed interpretations for every card.',
  keywords: ['Free Tarot Reading', 'AI Tarot', 'Online Tarot', 'Tarot Card Meanings', 'Daily Tarot', 'Tarot Spread'],
  openGraph: {
    title: 'Free AI Tarot Reading Online',
    description: 'Get an instant, accurate AI Tarot reading with detailed interpretations.',
    url: 'https://lordmagick.com/oracle-room/tarot-reading',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

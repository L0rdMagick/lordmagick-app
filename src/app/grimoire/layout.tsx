import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Digital Grimoire',
  description: 'Access your personal Grimoire where all your cast spells, saved rituals, and tarot readings are stored securely. Replay your magickal workings anytime.',
  robots: {
    index: false, // User private area, usually better not to index, but if public profiles exist, change to true
    follow: false,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

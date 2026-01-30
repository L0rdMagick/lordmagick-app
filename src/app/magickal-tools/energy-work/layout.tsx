import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Energy Work Tools',
  description: 'Tools for chakra alignment, aura cleansing, and subtle energy manipulation.',
  keywords: ['Energy Work', 'Chakra Balancing', 'Aura Cleansing', 'Reiki Tools', 'Crystal Healing'],
  openGraph: {
    title: 'Energy Work Tools',
    description: 'Tools for chakra alignment, aura cleansing, and subtle energy manipulation.',
    url: 'https://lordmagick.com/magickal-tools/energy-work',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

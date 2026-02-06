import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Geo Viewing Targets | Remote Viewing Practice & Psychic Training',
  description: 'Practice remote viewing with coordinate-based targets. Explore ancient sites, architectural marvels, and natural wonders to train your psychic abilities.',
  keywords: ['Remote Viewing', 'Geo Viewing', 'Psychic Training', 'ESP', 'Coordinate Remote Viewing', 'Ancient Sites', 'Psychic Development'],
  openGraph: {
    title: 'Geo Viewing Targets | Remote Viewing Practice',
    description: 'Train your psychic eye with our coordinate-based remote viewing tool. Access hundreds of ancient and modern targets.',
    images: ['/images/psychic-training-bg.jpg'], // Assuming a generic psychic training image exists, or uses default
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

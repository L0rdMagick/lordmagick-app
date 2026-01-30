import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Human Design Chart & Analysis',
  description: 'Generate your free Human Design chart. Understand your energy type, strategy, and authority. Discover your unique blueprint.',
  keywords: ['Human Design Chart', 'BodyGraph', 'Human Design Analysis', 'Energy Type', 'Generator', 'Projector', 'Manifestor', 'Reflector'],
  openGraph: {
    title: 'Free Human Design Chart & Analysis',
    description: 'Generate your free Human Design chart and understand your unique energetic blueprint.',
    url: 'https://lordmagick.com/oracle-room/human-design',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

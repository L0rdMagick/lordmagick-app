import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grimoire of Digital Servitors | Create Egregores',
  description: 'Create and house your own digital servitors and egregores. Giving life to thought-forms to assist you in your magickal practice.',
  keywords: ['Digital Servitors', 'Chaos Magick', 'Egregores', 'Thought Forms', 'Artificial Spirit', 'Servitor Creation'],
  openGraph: {
    title: 'Grimoire of Digital Servitors | Create Egregores',
    description: 'Create and house your own digital servitors and egregores.',
    url: 'https://lordmagick.com/spell-room/grimoire-of-digital-servitors',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

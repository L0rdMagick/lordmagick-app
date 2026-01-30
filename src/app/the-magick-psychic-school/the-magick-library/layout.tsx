import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Magick Library | Occult Books & Grimoires',
  description: 'A digital library of occult knowledge. Read ancient grimoires, modern witchcraft texts, and esoteric papers.',
  keywords: ['Occult Library', 'Grimoires', 'Witchcraft Books', 'Esoteric Texts', 'Magickal PDF'],
  openGraph: {
    title: 'The Magick Library | Occult Books & Grimoires',
    description: 'A digital library of occult knowledge and ancient grimoires.',
    url: 'https://lordmagick.com/the-magick-psychic-school/the-magick-library',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

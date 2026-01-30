import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Magick & Psychic School | Learn Witchcraft',
  description: 'Enroll in the Magick & Psychic School to master the arts of Witchcraft, Psychic Development, and High Magick. Access our extensive library of arcane knowledge.',
  keywords: ['Learn Witchcraft', 'Psychic Training', 'Magick School', 'Occult Studies', 'Develop Psychic Abilities', 'Witchcraft Course'],
  openGraph: {
    title: 'The Magick & Psychic School | Learn Witchcraft',
    description: 'Enroll in the Magick & Psychic School to master the arts of Witchcraft, Psychic Development, and High Magick.',
    url: 'https://lordmagick.com/the-magick-psychic-school',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

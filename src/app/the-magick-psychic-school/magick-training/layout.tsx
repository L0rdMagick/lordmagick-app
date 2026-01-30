import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Witchcraft & Magick Training Courses',
  description: 'Comprehensive training in the arts of Witchcraft and High Magick. Learn ritual structures, energy containment, and spellcasting fundamentals.',
  keywords: ['Witchcraft Course', 'Learn Magic', 'Occult Training', 'Ritual Magic', 'Spellcasting 101'],
  openGraph: {
    title: 'Witchcraft & Magick Training Courses',
    description: 'Comprehensive training in the arts of Witchcraft and High Magick.',
    url: 'https://lordmagick.com/the-magick-psychic-school/magick-training',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

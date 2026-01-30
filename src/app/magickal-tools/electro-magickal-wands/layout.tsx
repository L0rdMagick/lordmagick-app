import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Electro-Magickal Wands',
  description: 'Techno-magick devices for the modern sorcerer. Amplify your intention with our Electro-Magickal Wands.',
  keywords: ['Techno Magick', 'Cyber Witchcraft', 'Electro Wand', 'Psionic Device', 'Radionics'],
  openGraph: {
    title: 'Electro-Magickal Wands',
    description: 'Techno-magick devices for the modern sorcerer.',
    url: 'https://lordmagick.com/magickal-tools/electro-magickal-wands',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

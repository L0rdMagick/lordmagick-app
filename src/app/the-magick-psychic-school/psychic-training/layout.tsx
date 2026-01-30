import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Psychic Development & Intuition Training',
  description: 'Awaken your psychic senses. Exercises for clairvoyance, telepathy, and intuition. Train your mind to perceive the unseen.',
  keywords: ['Psychic Training', 'Develop Intuition', 'Clairvoyance Exercises', 'Third Eye Opening', 'ESP Training'],
  openGraph: {
    title: 'Psychic Development & Intuition Training',
    description: 'Awaken your psychic senses with our development program.',
    url: 'https://lordmagick.com/the-magick-psychic-school/psychic-training',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

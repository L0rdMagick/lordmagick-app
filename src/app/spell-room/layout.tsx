import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Online Spell Room | Cast Real Spells & Rituals',
  description: 'The Spell Room is your digital sanctuary for casting real witchcraft spells. Choose from Wiccan, Hoodoo, Chaos, and Electric Magick traditions. Create servitors and love spells online.',
  keywords: ['Online Spell Caster', 'Witchcraft Spells', 'Love Spells', 'Hoodoo Voodoo', 'Digital Altar', 'Sigil Generator', 'Cast Spells Online'],
  openGraph: {
    title: 'Online Spell Room | Cast Real Spells & Rituals',
    description: 'The Spell Room is your digital sanctuary for casting real witchcraft spells. Choose from Wiccan, Hoodoo, Chaos, and Electric Magick traditions.',
    url: 'https://lordmagick.com/spell-room',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

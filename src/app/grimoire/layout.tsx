import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Digital Grimoire | Book of Shadows & Journal',
  description: 'Access your personal Grimoire (Book of Shadows) to store custom spells, rituals, and journal entries. A secure, private space for your magickal journey.',
  robots: {
    index: false, // User private area
    follow: false,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

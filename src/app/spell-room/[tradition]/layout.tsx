import type { Metadata } from 'next';

type Props = {
  params: Promise<{ tradition: string }>;
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { tradition } = await params;
  const formattedTradition = tradition
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${formattedTradition} Spells & Rituals | Spell Room`,
    description: `Cast powerful ${formattedTradition} spells online. Ancient rituals adapted for the digital age. Practice ${formattedTradition} magick safely and effectively.`,
    openGraph: {
      title: `${formattedTradition} Spells & Rituals | Spell Room`,
      description: `Cast powerful ${formattedTradition} spells online. Ancient rituals adapted for the digital age.`,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

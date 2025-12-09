import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LordMagick Grimoire',
    short_name: 'Grimoire',
    description: 'A digital gateway to ancient secrets and modern magick.',
    start_url: '/hall', // Enter directly into the experience
    display: 'standalone', // Hides browser UI
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
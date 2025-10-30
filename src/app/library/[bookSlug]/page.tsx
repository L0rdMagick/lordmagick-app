import { libraryBooks } from '../content';
import BookReader from '../BookReader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ bookSlug: string; }>;
}

export default async function BookPage({ params }: PageProps) {
  const { bookSlug } = await params;
  const book = libraryBooks.find((b) => b.slug === bookSlug);

  if (!book) {
    notFound();
  }

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur" />
      
      <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col sm:flex-row justify-between items-center p-4 gap-2">
        <Link href="/library" className="text-gray-300 hover:text-amber-300 transition-colors duration-300 text-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
          &larr; Back to Bookshelf
        </Link>
        <Link href="/hall" className="text-gray-300 hover:text-amber-300 transition-colors duration-300 text-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
          Return to Grand Hall &rarr;
        </Link>
      </nav>

      {/* 
        THE FIX: Reduced top padding on mobile from `pt-24` to `pt-20`.
        This pulls the book up on smaller screens, while the `sm:pt-16`
        for larger screens remains unchanged.
      */}
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 pt-0 sm:pt-16">
        <BookReader book={book} />
      </div>
    </main>
  );
}
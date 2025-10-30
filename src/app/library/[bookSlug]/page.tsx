// We no longer need the raw bookCache for testing
import { getBookBySlug } from '@/lib/library'; 
import BookReader from '../BookReader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// THE FIX: This line ensures the page is always rendered dynamically on the server
// at request time, guaranteeing that the URL params are available.
export const dynamic = 'force-dynamic';

interface PageProps {
  params: { bookSlug: string; };
}

export default async function BookPage({ params }: PageProps) {
  // Check if params or bookSlug are missing, and trigger a 404 if so.
  if (!params || !params.bookSlug) {
    console.error('[RUNTIME ERROR] Page was rendered without a bookSlug in params.');
    notFound();
  }

  const bookSlug = decodeURIComponent(params.bookSlug);
  const book = await getBookBySlug(bookSlug);

  if (!book) {
    // This will now correctly trigger if a book like "non-existent-book" is visited.
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
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 pt-20 sm:pt-16">
        <BookReader book={book} />
      </div>
    </main>
  );
}
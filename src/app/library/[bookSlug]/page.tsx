import { getBookBySlug } from '@/lib/library'; 
import BookReader from '../BookReader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// THE FINAL FIX (Part 1): These two lines explicitly tell Next.js and Vercel:
// 1. This page MUST be rendered dynamically on every request.
// 2. You are NOT ALLOWED to cache anything for this page.
// This forces Next.js to correctly parse the URL and provide the params every time.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// The interface is fine, but we'll use an inline type for maximum clarity.
export default async function BookPage({ params }: { params: { bookSlug: string } }) {
  
  // Our defensive check remains.
  if (!params || !params.bookSlug) {
    // This should no longer be possible with the configuration above.
    console.error('[RUNTIME ERROR] Page was rendered without a bookSlug in params. This indicates a severe Next.js routing issue.');
    notFound();
  }

  const bookSlug = decodeURIComponent(params.bookSlug);
  const book = await getBookBySlug(bookSlug);

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
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 pt-20 sm:pt-16">
        <BookReader book={book} />
      </div>
    </main>
  );
}
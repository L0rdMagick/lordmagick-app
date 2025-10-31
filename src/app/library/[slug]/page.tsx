// This is now a Server Component. No "use client".
import { getBookHtmlContent } from '@/lib/library';
import BookReader from '../BookReader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// This safeguard remains to prevent framework caching issues.
export const dynamic = 'force-dynamic';

export default async function BookPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  if (!slug) {
    // This will catch any framework errors where the slug isn't passed.
    notFound();
  }

  // THE FIX: Directly call our new function on the server to get the book content.
  const book = await getBookHtmlContent(slug);

  // If the file doesn't exist, this will correctly trigger a 404 page.
  if (!book) {
    notFound();
  }

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur" />
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-end items-center p-4 gap-4">
        <Link href="/library" className="text-gray-300 hover:text-amber-300" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
          &larr; Bookshelf
        </Link>
        <Link href="/hall" className="text-gray-300 hover:text-amber-300" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
          Grand Hall &rarr;
        </Link>
      </nav>
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8">
        {/* Pass the fetched title and HTML content directly to the simple reader component. */}
        <BookReader title={book.title} content={book.content} />
      </div>
    </main>
  );
}
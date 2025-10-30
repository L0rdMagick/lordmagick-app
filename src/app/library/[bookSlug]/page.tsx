import { getBookBySlug, getAllBooks } from '../../../lib/library'; // FIX: Use a direct relative path.
import BookReader from '../BookReader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { bookSlug: string; };
}

export async function generateStaticParams() {
  const books = getAllBooks();
  return books.map((book) => ({
    bookSlug: book.slug,
  }));
}

export default function BookPage({ params }: PageProps) {
  const { bookSlug } = params;
  const book = getBookBySlug(bookSlug);

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
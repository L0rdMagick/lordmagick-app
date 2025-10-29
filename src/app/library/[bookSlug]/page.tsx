import { libraryBooks } from '../content';
import BookReader from './BookReader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    bookSlug: string;
  };
}

export default function BookPage({ params }: PageProps) {
  const { bookSlug } = params;
  const book = libraryBooks.find((b) => b.slug === bookSlug);

  // If the book isn't found, show a 404 page
  if (!book) {
    notFound();
  }

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur" />
      
      {/* Back to Library Link */}
      <Link 
        href="/library" 
        className="fixed top-4 left-4 z-50 text-gray-300 hover:text-amber-300 transition-colors duration-300 text-lg"
        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}
      >
        &larr; Back to Bookshelf
      </Link>

      <div className="flex items-center justify-center min-h-screen">
        <BookReader book={book} />
      </div>
    </main>
  );
}
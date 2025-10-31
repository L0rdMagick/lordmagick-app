import { getAllBooks } from '@/lib/library';
import BookshelfClient from './BookshelfClient';

export default function LibraryPage() {
  const allBooks = getAllBooks();
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 text-center text-white">
        <h1 className="text-5xl md:text-6xl text-amber-300" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          The Library
        </h1>
        <p className="mt-4 text-lg text-gray-300">Select a tome to begin your studies.</p>
      </div>
      <BookshelfClient books={allBooks} />
    </main>
  );
}
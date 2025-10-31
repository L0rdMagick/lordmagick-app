// This is your main library bookshelf page.
import { getAllBooks } from '@/lib/library';
// THE DEFINITIVE FIX: It now imports and uses the correct component.
import BookshelfClient from './BookshelfClient';

export default function LibraryPage() {
  
  // This correctly fetches the list of all book summaries.
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

      {/* This line now correctly renders <BookshelfClient /> and passes the 'books' prop. The error will be gone. */}
      <BookshelfClient books={allBooks} />

    </main>
  );
}
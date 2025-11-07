import { getAllBooks } from '@/lib/library';
import BookshelfClient from './BookshelfClient';
import RoomsButton from '../components/RoomsButton';

export default function LibraryPage() {
  const allBooks = getAllBooks();
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* THE FIX: Implemented the responsive header structure */}
      <header className="relative z-10 mb-12 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <div className="text-center md:text-left">
                <h1 className="text-5xl md:text-6xl text-amber-300" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  The Library
                </h1>
                <p className="mt-4 text-lg text-gray-300">Select a tome to begin your studies.</p>
            </div>
            <RoomsButton className="ml-0 md:ml-8" />
        </div>
      </header>

      <BookshelfClient books={allBooks} />
    </main>
  );
}
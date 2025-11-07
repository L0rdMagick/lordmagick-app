import { getAllBooks } from '@/lib/library';
import BookshelfClient from './BookshelfClient';
import RoomsButton from '../components/RoomsButton'; // THE FIX: Import the button

export default function LibraryPage() {
  const allBooks = getAllBooks();
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* THE FIX: Header is now a flex container */}
      <header className="relative z-10 flex justify-between items-center text-white">
        <div className="text-left">
            <h1 className="text-5xl md:text-6xl text-amber-300" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              The Library
            </h1>
            <p className="mt-4 text-lg text-gray-300">Select a tome to begin your studies.</p>
        </div>
        <RoomsButton />
      </header>

      <BookshelfClient books={allBooks} />
    </main>
  );
}
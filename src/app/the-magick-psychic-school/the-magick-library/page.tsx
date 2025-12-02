import { getAllBooks } from '@/lib/library';
import BookshelfClient from '@/app/components/BookshelfClient'; // Check import path if necessary, likely fine
import RoomsButton from '@/app/components/RoomsButton'; // Check import path
import MagickalBackLink from '@/app/components/MagickalBackLink';

export default function LibraryPage() {
  const allBooks = getAllBooks();
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <header className="relative z-10 mb-12 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <div className="order-1">
                {/* UPDATED BACK LINK */}
                <MagickalBackLink href="/the-magick-psychic-school" text="The School" />
            </div>
            
            <div className="text-center md:text-left order-3 md:order-2">
                <h1 className="text-5xl md:text-6xl text-amber-300" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  The Magick Library
                </h1>
                <p className="mt-4 text-lg text-gray-300">Select a tome to begin your studies.</p>
            </div>
            <div className="order-2 md:order-3">
                <RoomsButton className="ml-0 md:ml-8" />
            </div>
        </div>
      </header>

      <BookshelfClient books={allBooks} />
    </main>
  );
}
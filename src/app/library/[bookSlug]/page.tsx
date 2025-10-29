import { libraryBooks } from '../content';
import BookReader from '../BookReader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  // The params object itself is a Promise in recent Next.js versions
  params: Promise<{
    bookSlug: string;
  }>;
}

// THE FIX 1: The function is now `async`
export default async function BookPage({ params }: PageProps) {
  // THE FIX 2: We `await` the params to resolve the Promise
  const { bookSlug } = await params;
  
  // (You can remove the diagnostic console.logs now if you wish)
  console.log(`Trying to find book with slug: "${bookSlug}"`);
  
  const book = libraryBooks.find((b) => b.slug === bookSlug);

  if (!book) {
    console.error(`Book with slug "${bookSlug}" was NOT FOUND in content.ts!`);
    notFound();
  }
  
  console.log(`Successfully found book: "${book.title}"`);

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur" />
      
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
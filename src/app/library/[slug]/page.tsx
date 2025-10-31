import { getBookHtmlContent } from '@/lib/library';
import BookReader from '../BookReader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BookPage({ params }: { params: { slug: string } }) {
  // --- START OF DIAGNOSTIC LOGGING ---
  console.log(`[SERVER LOG] START: BookPage render initiated.`);
  
  const slug = params.slug;
  if (!slug) {
    console.error('[SERVER ERROR] CRITICAL: Slug parameter is missing. Triggering notFound().');
    notFound();
  }
  console.log(`[SERVER LOG] INFO: Received slug: "${slug}"`);

  let book = null;
  try {
    console.log(`[SERVER LOG] ACTION: Calling getBookHtmlContent("${slug}")...`);
    book = await getBookHtmlContent(slug);
    
    if (book) {
      console.log(`[SERVER LOG] SUCCESS: Book content fetched for "${book.title}".`);
    } else {
      // This will be our most important clue if the file isn't found
      console.error(`[SERVER ERROR] CRITICAL: getBookHtmlContent returned null for slug "${slug}". This means the file was not found. Triggering notFound().`);
      notFound();
    }
  } catch (error) {
    // This will catch any unexpected crashes inside the library function.
    console.error(`[SERVER CATASTROPHE] An unhandled error occurred while fetching book content for slug "${slug}":`, error);
    notFound();
  }
  
  console.log(`[SERVER LOG] PRE-RENDER: Data is ready. Preparing to render BookReader component.`);
  // --- END OF DIAGNOSTIC LOGGING ---

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
        <BookReader title={book.title} content={book.content} />
      </div>
    </main>
  );
}
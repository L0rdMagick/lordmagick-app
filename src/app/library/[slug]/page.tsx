import { getBookHtmlContent } from '@/lib/library';
import BookReader from '../BookReader';
import Link from 'next/link';
import { notFound } from 'next/navigation';
// We need to import 'headers' to read the incoming request URL.
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// The 'params' object is now irrelevant as we will not use it.
export default async function BookPage({ params }: { params: { slug: string } }) {
  
  // THE FINAL FIX: We will manually parse the slug from the request URL.
  // This completely bypasses the broken 'params' object.
  const headersList = headers();
  const referer = headersList.get('referer') || ''; // Fallback for safety
  const urlPath = headersList.get('x-invoke-path') || ''; // Vercel-specific header
  
  // From the URL path '/library/spirit-work-and-mediumship', we get the last part.
  const slug = urlPath.split('/').pop();

  console.log(`[SERVER LOG] Manually parsed slug: "${slug}" from path: "${urlPath}"`);

  if (!slug || slug === 'undefined') {
    // This will catch any errors if the URL parsing fails.
    console.error(`[SERVER ERROR] Could not determine a valid slug from the URL.`);
    notFound();
  }

  // The rest of the code now works perfectly with our manually-derived slug.
  const book = await getBookHtmlContent(slug);

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
        <BookReader title={book.title} content={book.content} />
      </div>
    </main>
  );
}
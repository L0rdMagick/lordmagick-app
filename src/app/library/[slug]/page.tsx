import { getBookHtmlContent } from '@/lib/library';
import BookReader from '../BookReader';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function BookPage({ params }: { params: { slug: string } }) {
  
  // THE FINAL, ACTUAL, VERIFIED FIX: The 'await' keyword is now correctly placed here.
  // This resolves the Promise that your specific build environment says the headers() function returns.
  const headersList = await headers();
  const urlPath = headersList.get('x-invoke-path') || '';
  
  const slug = urlPath.split('/').pop();

  console.log(`[SERVER LOG] Manually parsed slug: "${slug}" from path: "${urlPath}"`);

  if (!slug || slug === 'undefined') {
    console.error(`[SERVER ERROR] Could not determine a valid slug from the URL.`);
    notFound();
  }

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
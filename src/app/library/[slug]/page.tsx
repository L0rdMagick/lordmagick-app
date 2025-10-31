import { getBookHtmlContent } from '@/lib/library';
import BookReader from '../BookReader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BookPage({ params }: { params: { slug: string } }) {
  // THE FINAL TEST: This log will prove if the server is running this new code.
  console.log(`[SERVER LOG] Attempting to render page for slug: "${params.slug}"`);

  const slug = params.slug;
  if (!slug) {
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
import { getBookBySlug } from '@/lib/library';
// Import NextRequest specifically for the correct type
import { NextRequest, NextResponse } from 'next/server';

// THE FIX: The function signature now perfectly matches what the Next.js
// build process expects for an App Router API Route Handler.
export async function GET(
  request: NextRequest, // Use NextRequest instead of the generic Request
  { params }: { params: { slug: string } } // This is the correct context object structure
) {
  try {
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json({ error: 'Book slug is required' }, { status: 400 });
    }

    const book = await getBookBySlug(slug);

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Return the book data successfully.
    return NextResponse.json(book);

  } catch (error) {
    console.error('[API ERROR] /api/books/[slug]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
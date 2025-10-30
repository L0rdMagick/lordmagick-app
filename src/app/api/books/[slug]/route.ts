import { getBookBySlug } from '@/lib/library';
import { NextResponse } from 'next/server';

// This is a dedicated serverless function that acts as our book API.
// It receives a slug and returns the book data as JSON.
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
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
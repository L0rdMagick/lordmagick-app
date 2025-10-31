import { getBookHtmlContent } from '@/lib/library';
import { NextRequest, NextResponse } from 'next/server';

// This is our reliable API endpoint.
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ error: 'Book slug is required' }, { status: 400 });
    }

    const book = await getBookHtmlContent(slug);

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Return the book's title and HTML content as JSON.
    return NextResponse.json(book);

  } catch (error) {
    console.error('[API ERROR] /api/books/[slug]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
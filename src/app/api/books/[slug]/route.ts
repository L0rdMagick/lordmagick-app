import { getBookBySlug } from '@/lib/library';
import { NextRequest, NextResponse } from 'next/server';

// THE FINAL FIX: The function signature now accepts that 'params' is a Promise.
// This is required by your specific Next.js v16.0.0 environment.
export async function GET(
  request: NextRequest,
  // The context object's 'params' property is a Promise, as dictated by the error log.
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // We MUST await the context.params to resolve the Promise and get the slug.
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ error: 'Book slug is required' }, { status: 400 });
    }

    const book = await getBookBySlug(slug);

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(book);

  } catch (error) {
    console.error('[API ERROR] /api/books/[slug]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
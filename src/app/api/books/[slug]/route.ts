import { bookCache } from '@/lib/library';
import { NextRequest, NextResponse } from 'next/server';
import { remark } from 'remark';
import html from 'remark-html';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ error: 'Book slug is required' }, { status: 400 });
    }

    const cachedBook = bookCache[slug];
    if (!cachedBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // THE FIX: Convert raw markdown content directly to HTML.
    const processedContent = await remark().use(html).process(cachedBook.rawContent);
    const contentHtml = processedContent.toString();

    // Return the title and the clean HTML content.
    return NextResponse.json({
      title: cachedBook.title,
      content: contentHtml,
    });

  } catch (error) {
    console.error('[API ERROR] /api/books/[slug] HTML Generation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
import { bookCache } from '@/lib/library'; // We'll use our reliable in-memory cache
import { NextRequest, NextResponse } from 'next/server';
import Epub from "epub-gen";

// This is our new, powerful API endpoint that generates EPUB files on the fly.
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return new Response('Book slug is required', { status: 400 });
    }

    const cachedBook = bookCache[slug];
    if (!cachedBook) {
      return new Response('Book not found in cache', { status: 404 });
    }

    // --- EPUB Generation Logic ---
    // 1. Prepare the content array for epub-gen
    const chapterHeadings = cachedBook.rawContent.split('\n## ').filter(c => c.trim() !== '');
    const epubContent = chapterHeadings.map(chapterText => {
      const lines = chapterText.split('\n');
      const title = lines[0].trim();
      const data = lines.slice(1).join('\n'); // The raw markdown content
      return { title, data };
    });

    // 2. Define the options for our EPUB file
    const options = {
      title: cachedBook.title,
      author: "LordMagick", // You can customize this
      content: epubContent,
    };

    // 3. Generate the EPUB in memory
    const epubBuffer = await new Epub(options).genEpub();

    // 4. Send the EPUB file back to the client
    return new Response(epubBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': `attachment; filename="${slug}.epub"`,
      },
    });

  } catch (error) {
    console.error('[API ERROR] /api/books/[slug] EPUB Generation:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
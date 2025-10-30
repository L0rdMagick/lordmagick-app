import { bookCache } from '@/lib/library';
import { NextRequest, NextResponse } from 'next/server';
import Epub from "epub-gen";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    console.log(`[API START] Received request for slug: "${slug}"`);

    if (!slug) {
      console.error('[API ERROR] Slug was missing from params.');
      return new Response('Book slug is required', { status: 400 });
    }

    const cachedBook = bookCache[slug];
    if (!cachedBook) {
      console.error(`[API ERROR] Book with slug "${slug}" not found in cache.`);
      return new Response('Book not found in cache', { status: 404 });
    }
    console.log(`[API INFO] Found cached book: "${cachedBook.title}"`);

    // --- EPUB Generation Logic with Robust Guardrails ---
    const chapterHeadings = cachedBook.rawContent.split('\n## ').filter(c => c.trim() !== '' && !c.startsWith('-'));
    const epubContent = chapterHeadings.map(chapterText => {
      const lines = chapterText.split('\n');
      const title = lines[0].trim();
      const data = lines.slice(1).join('\n'); // Raw markdown
      return { title, data };
    });

    // THE FIX: This is the critical guardrail. If our parser finds no valid chapters,
    // we stop here and return an error instead of crashing epub-gen.
    if (epubContent.length === 0) {
      console.error(`[API ERROR] No valid chapters found for "${slug}". Cannot generate EPUB.`);
      return new Response('Book content is empty or invalid', { status: 500 });
    }
    console.log(`[API INFO] Parsed ${epubContent.length} chapters for EPUB generation.`);

    const options = {
      title: cachedBook.title,
      author: "LordMagick",
      content: epubContent,
    };

    console.log('[API INFO] Generating EPUB...');
    const epubBuffer = await new Epub(options).genEpub();
    console.log('[API SUCCESS] EPUB generated successfully.');

    return new Response(epubBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': `attachment; filename="${slug}.epub"`,
      },
    });

  } catch (error) {
    console.error('[API CATASTROPHE] An unexpected error occurred during EPUB generation:', error);
    return new Response('Internal Server Error while generating book', { status: 500 });
  }
}
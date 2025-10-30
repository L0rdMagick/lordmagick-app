import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export interface Chapter {
  title: string;
  content: string;
}

export interface Book {
  slug: string;
  title: string;
  coverImage: string;
  chapters: Chapter[];
}

export type BookSummary = Pick<Book, 'slug' | 'title' | 'coverImage'>;

interface BookCache {
  [slug: string]: {
    title: string;
    rawContent: string;
  };
}

export const bookCache: BookCache = {};
const booksDirectory = path.join(process.cwd(), 'src', 'books');

try {
  const fileNames = fs.readdirSync(booksDirectory).filter(file => file.endsWith('.md'));
  for (const fileName of fileNames) {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(booksDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    if (data.title) {
      bookCache[slug] = {
        title: data.title,
        rawContent: content,
      };
    }
  }
  console.log('[BUILD-TIME] Successfully built book registry:', Object.keys(bookCache));
} catch (error) {
  console.error('[BUILD-TIME] CRITICAL ERROR: Failed to read books directory and build registry.', error);
}

// This function now correctly handles the "End of Book" marker.
async function parseBookContent(rawContent: string): Promise<Chapter[]> {
  // THE FIX (Part 1): We define an end marker and slice the content.
  // This ensures that any instructional text after the marker is ignored.
  const endOfBookMarker = '\n---';
  const endMarkerIndex = rawContent.indexOf(endOfBookMarker);
  const bookContent = endMarkerIndex !== -1 ? rawContent.slice(0, endMarkerIndex) : rawContent;

  const chapterHeadings = bookContent.split('\n## ').filter(c => c.trim() !== '' && !c.startsWith('-'));

  const chapters: Chapter[] = await Promise.all(
    chapterHeadings.map(async (chapterText) => {
      const lines = chapterText.split('\n');
      const title = lines[0].trim();
      const chapterContentRaw = lines.slice(1).join('\n');
      const processedContent = await remark().use(html).process(chapterContentRaw);
      return { title, content: processedContent.toString() };
    })
  );
  return chapters;
}

export async function getAllBooks(): Promise<BookSummary[]> {
  const allBookSummaries = Object.entries(bookCache).map(([slug, data]) => {
    const coverImageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    let coverImage = '/images/books/default-cover.png';
    for (const ext of coverImageExtensions) {
      if (fs.existsSync(path.join(process.cwd(), `public/images/books/${slug}.${ext}`))) {
        coverImage = `/images/books/${slug}.${ext}`;
        break;
      }
    }
    return { slug, title: data.title, coverImage };
  });
  return allBookSummaries;
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const cachedBook = bookCache[slug];
  if (!cachedBook) {
    console.error(`[RUNTIME ERROR] Book with slug "${slug}" not found in cache.`);
    return null;
  }
  const coverImageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
  let coverImage = '/images/books/default-cover.png';
  for (const ext of coverImageExtensions) {
    if (fs.existsSync(path.join(process.cwd(), `public/images/books/${slug}.${ext}`))) {
      coverImage = `/images/books/${slug}.${ext}`;
      break;
    }
  }
  const chapters = await parseBookContent(cachedBook.rawContent);
  return { slug, title: cachedBook.title, coverImage, chapters };
}
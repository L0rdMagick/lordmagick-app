import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// --- TYPE DEFINITIONS ---
export interface Chapter {
  title: string;
  content: string; // HTML content
}

export interface Book {
  slug: string;
  title: string;
  coverImage: string;
  chapters: Chapter[];
}

// THE FIX (Part 1): Export a new type for the book summary.
export type BookSummary = Pick<Book, 'slug' | 'title' | 'coverImage'>;


// --- THE IN-MEMORY REGISTRY ---
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

// --- HELPER FUNCTION ---
async function parseBookContent(rawContent: string): Promise<Chapter[]> {
  const chapterHeadings = rawContent.split('\n## ').filter(c => c.trim() !== '');

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


// --- REVISED PUBLIC FUNCTIONS ---
/**
 * Gets a summary of all available books. Fast and efficient for the bookshelf.
 */
// THE FIX (Part 2): Update the return type signature.
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
    return {
      slug,
      title: data.title,
      coverImage,
    };
  });

  return allBookSummaries;
}

/**
 * Gets the full, parsed content of a single book by its slug.
 */
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

  return {
    slug,
    title: cachedBook.title,
    coverImage,
    chapters,
  };
}
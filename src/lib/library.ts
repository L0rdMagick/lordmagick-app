import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// --- TYPE DEFINITIONS ---
// This is the summary used by the bookshelf page.
export interface BookSummary {
  slug: string;
  title: string;
  coverImage: string;
}

// This is the structure of our in-memory cache.
interface BookCache {
  [slug: string]: {
    title: string;
    rawContent: string;
  };
}

// --- THE IN-MEMORY REGISTRY ---
// We build a cache of all book content when the server starts.
// THE FIX: We now correctly 'export' this cache so our API can use it.
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

// --- FUNCTION FOR THE BOOKSHELF PAGE ---
// This function reads from the cache to get a list of all book summaries.
export function getAllBooks(): BookSummary[] {
  const allBookSummaries = Object.entries(bookCache).map(([slug, data]) => {
    // Find the corresponding cover image
    const coverImageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    let coverImage = '/images/books/default-cover.png'; // A fallback
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
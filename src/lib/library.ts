import fs from 'fs';
import path from 'path';
// NO LONGER IMPORTING 'gray-matter' or 'marked'
import type { Book } from '@/types';

const booksDirectory = path.join(process.cwd(), 'src/content/books');

export function getAllBooks(): Book[] {
  const allEntries = fs.readdirSync(booksDirectory);
  const bookSlugs = allEntries.filter(entry => {
    const fullPath = path.join(booksDirectory, entry);
    return fs.statSync(fullPath).isDirectory();
  });
  // This still needs to return an array of book-like objects for generateStaticParams
  return bookSlugs.map(slug => ({
    slug: slug,
    title: 'Test Title',
    coverImage: '/images/books/placeholder.png', // A known-good image path
    chapters: [],
  }));
}

export function getBookBySlug(slug: string): Book {
  // THE DEFINITIVE DIAGNOSTIC STEP:
  // This function IGNORES the file content entirely.
  // It returns a completely hardcoded, 100% serializable object.
  // If the build passes with this code, the problem is proven to be one of
  // the parsing libraries we removed.
  const hardcodedBook: Book = {
    slug: slug,
    title: `Test Book: ${slug}`,
    coverImage: '/images/books/energy-work-and-manipulation.png', // Use a known-good path
    chapters: [
      {
        title: 'Test Chapter',
        content: '<p>This is a test. If you see this, the build worked.</p>'
      }
    ]
  };

  return hardcodedBook;
}
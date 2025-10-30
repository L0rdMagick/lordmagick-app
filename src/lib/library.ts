import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
// NO LONGER IMPORTING 'marked'
import type { Book } from '@/types';

const booksDirectory = path.join(process.cwd(), 'src/content/books');

export function getAllBooks(): Book[] {
  const allEntries = fs.readdirSync(booksDirectory);
  const bookSlugs = allEntries.filter(entry => {
    const fullPath = path.join(booksDirectory, entry);
    return fs.statSync(fullPath).isDirectory();
  });
  return bookSlugs.map(slug => getBookBySlug(slug));
}

export function getBookBySlug(slug: string): Book {
  const fullPath = path.join(booksDirectory, slug, 'index.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // DIAGNOSTIC STEP: We are NOT parsing the markdown.
  // We are creating a single "chapter" with the raw, unprocessed content.
  // We wrap it in <pre> tags so it displays on the page without breaking HTML.
  const chapters = [{
    title: 'Raw Markdown Content',
    content: `<pre style="white-space: pre-wrap; word-wrap: break-word;">${content}</pre>`
  }];

  const bookData: Book = {
    slug: slug,
    title: data.title || 'Untitled Book',
    coverImage: data.coverImage || '',
    chapters: chapters,
  };

  // The final sanitization step remains as a best practice.
  return JSON.parse(JSON.stringify(bookData));
}
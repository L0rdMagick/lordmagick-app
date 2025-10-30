import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
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
  
  // 1. Parse the metadata and content with gray-matter
  const { data, content } = matter(fileContents);

  // 2. Use marked's SYNCHRONOUS parser. This returns a simple, clean string.
  const contentHtml = marked.parseSync(content || '');

  // 3. Robustly parse the resulting HTML into chapters
  const chapters: { title: string; content: string }[] = [];
  const chapterParts = contentHtml.split(/(<h2[^>]*>.*?<\/h2>)/);
  if (chapterParts.length > 1 && chapterParts[0].trim() === '') {
    chapterParts.shift();
  }
  for (let i = 0; i < chapterParts.length; i += 2) {
    const titleHtml = chapterParts[i];
    const contentHtmlFragment = chapterParts[i + 1] || '';
    const title = titleHtml.replace(/<[^>]+>/g, '').trim();
    if (title) {
      chapters.push({ title, content: contentHtmlFragment.trim() });
    }
  }

  // 4. Build the final, clean book object
  const bookData: Book = {
    slug: slug,
    title: data.title || 'Untitled Book',
    coverImage: data.coverImage || '',
    chapters: chapters,
  };

  // 5. As a final guarantee, sanitize the object to ensure it's 100% serializable
  return JSON.parse(JSON.stringify(bookData));
}
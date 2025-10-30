import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { Book } from '@/types';

const booksDirectory = path.join(process.cwd(), 'src/content/books');

export async function getAllBooks(): Promise<Book[]> {
  const allEntries = fs.readdirSync(booksDirectory);
  const bookSlugs = allEntries.filter(entry => {
    const fullPath = path.join(booksDirectory, entry);
    return fs.statSync(fullPath).isDirectory();
  });
  
  const allBooksData = await Promise.all(bookSlugs.map(slug => getBookBySlug(slug)));
  return allBooksData;
}

export async function getBookBySlug(slug: string): Promise<Book> {
  const fullPath = path.join(booksDirectory, slug, 'index.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // THE FIX: Correctly 'await' the asynchronous 'marked.parse()' function.
  const contentHtml = await marked.parse(content || '');

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

  const bookData: Book = {
    slug: slug,
    title: data.title || 'Untitled Book',
    coverImage: data.coverImage || '',
    chapters: chapters,
  };

  // The final sanitization step remains as the ultimate guarantee.
  return JSON.parse(JSON.stringify(bookData));
}
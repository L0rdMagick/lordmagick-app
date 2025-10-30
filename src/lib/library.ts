import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { Book } from '@/types';

const booksDirectory = path.join(process.cwd(), 'src/content/books');

// This function now returns a Promise
export async function getAllBooks(): Promise<Book[]> {
  const allEntries = fs.readdirSync(booksDirectory);
  const bookSlugs = allEntries.filter(entry => {
    const fullPath = path.join(booksDirectory, entry);
    return fs.statSync(fullPath).isDirectory();
  });
  
  // Use Promise.all to wait for all books to be processed
  const allBooksData = await Promise.all(bookSlugs.map(slug => getBookBySlug(slug)));
  return allBooksData;
}

// This function now also returns a Promise
export async function getBookBySlug(slug: string): Promise<Book> {
  const fullPath = path.join(booksDirectory, slug, 'index.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // THE FIX: We must 'await' the result of marked.parse
  const contentHtml = await marked.parse(content);

  const chapters: { title: string; content: string }[] = [];
  
  const chapterSplit = contentHtml.split(/(<h2[^>]*>.*?<\/h2>)/);
  if (chapterSplit.length > 0 && chapterSplit[0].trim() === '') {
      chapterSplit.shift();
  }

  for (let i = 0; i < chapterSplit.length; i += 2) {
    const titleHtml = chapterSplit[i];
    const contentHtmlFragment = chapterSplit[i + 1] || '';
    
    const title = titleHtml.replace(/<[^>]+>/g, ''); 
    
    chapters.push({ title, content: contentHtmlFragment });
  }

  const bookData: Book = {
    slug: slug,
    title: data.title || 'Untitled Book',
    coverImage: data.coverImage || '',
    chapters: chapters,
  };

  return JSON.parse(JSON.stringify(bookData));
}
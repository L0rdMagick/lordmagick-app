import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import type { Book } from '@/types';

// The path is now relative to `process.cwd()`, pointing back into src/content
const booksDirectory = path.join(process.cwd(), 'src/content/books');

export function getAllBooks(): Book[] {
  const allEntries = fs.readdirSync(booksDirectory);

  const bookSlugs = allEntries.filter(entry => {
    const fullPath = path.join(booksDirectory, entry);
    return fs.statSync(fullPath).isDirectory();
  });

  const allBooksData = bookSlugs.map((slug) => {
    return getBookBySlug(slug);
  });

  return allBooksData;
}

export function getBookBySlug(slug: string): Book {
  const fullPath = path.join(booksDirectory, slug, 'index.md');
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Markdown file not found for slug: ${slug}`);
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);

  // THE DEFINITIVE FIX IS HERE:
  // We process the markdown, and then explicitly cast the result to a plain String.
  // This removes any complex VFile object types from the processing pipeline.
  const processedContent = remark()
    .use(html)
    .processSync(matterResult.content);
  
  const contentHtml = String(processedContent); // This is the crucial change.

  const chaptersHtml = contentHtml.split(/<h2.*?>/);
  if (chaptersHtml.length > 0) {
    chaptersHtml.shift(); 
  }

  const chapters = chaptersHtml.map((chapterHtml) => {
    const titleMatch = chapterHtml.match(/^(.*?)<\/h2>/);
    const title = titleMatch ? titleMatch[1] : 'Untitled Chapter';
    const content = chapterHtml.substring(titleMatch ? titleMatch[0].length : 0).trim();
    
    return { title, content };
  });

  const bookData: Book = {
    slug,
    title: matterResult.data.title,
    coverImage: matterResult.data.coverImage,
    chapters,
  };

  return bookData;
}
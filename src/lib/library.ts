import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
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
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = remark()
    .use(html)
    .processSync(matterResult.content);
  
  const contentHtml = String(processedContent);

  let parsedChapters: { title: string; content: string }[] = [];

  // Robustly split content into chapters
  const chaptersHtml = contentHtml.split(/<h2.*?>/).filter(Boolean); // .filter(Boolean) removes empty strings

  if (chaptersHtml.length > 0) {
    // If we have a heading, the first element might be content before the first h2.
    // A more robust way is to check if the original content starts with a heading.
    const contentBeforeFirstHeading = contentHtml.split(/<h2.*?>/)[0];
    if (contentBeforeFirstHeading && contentBeforeFirstHeading.trim() !== '') {
        // This logic might need adjustment if you have content before the first chapter.
        // For now, we assume chapters start with H2.
    }
    
    parsedChapters = chaptersHtml.map((chapterHtml) => {
      const titleMatch = chapterHtml.match(/^(.*?)<\/h2>/);
      const title = titleMatch ? titleMatch[1] : 'Untitled Chapter';
      const content = chapterHtml.substring(titleMatch ? titleMatch[0].length : 0).trim();
      return { title, content };
    });
  }

  // THE DEFINITIVE FIX:
  // Create the final object and then "purify" it by running it through JSON.stringify and JSON.parse.
  // This is a "sledgehammer" technique to strip out any and all complex object prototypes,
  // functions, or `undefined` values, leaving only pure, serializable data that the Next.js
  // build process cannot possibly reject.
  const bookDataObject = {
    slug: slug,
    title: matterResult.data.title || 'Untitled Book',
    coverImage: matterResult.data.coverImage || '',
    chapters: parsedChapters,
  };

  return JSON.parse(JSON.stringify(bookDataObject));
}
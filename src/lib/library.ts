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
  const processedContent = remark().use(html).processSync(matterResult.content);
  const contentHtml = String(processedContent);

  const chaptersHtml = contentHtml.split(/<h2.*?>/);
  if (chaptersHtml.length > 0) {
    chaptersHtml.shift(); 
  }

  const parsedChapters = chaptersHtml.map((chapterHtml) => {
    const titleMatch = chapterHtml.match(/^(.*?)<\/h2>/);
    const title = titleMatch ? titleMatch[1] : 'Untitled Chapter';
    const content = chapterHtml.substring(titleMatch ? titleMatch[0].length : 0).trim();
    return { title, content };
  });

  // THE DEFINITIVE FIX:
  // We now provide a default empty string ('') for any frontmatter property
  // that might be missing (undefined). This guarantees that the final object
  // is always 100% serializable and will never contain `undefined`.
  const cleanBookObject: Book = {
    slug: slug,
    title: matterResult.data.title || '',
    coverImage: matterResult.data.coverImage || '',
    chapters: parsedChapters.map(chapter => ({
      title: chapter.title,
      content: chapter.content
    }))
  };

  return cleanBookObject;
}
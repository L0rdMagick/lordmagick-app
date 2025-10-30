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

  const allBooksData = bookSlugs.map((slug) => {
    return getBookBySlug(slug);
  });

  return allBooksData;
}

export function getBookBySlug(slug: string): Book {
  const fullPath = path.join(booksDirectory, slug, 'index.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);

  const processedContent = remark()
    .use(html)
    .processSync(matterResult.content);
  
  const contentHtml = String(processedContent);

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

  // DEFENSIVE FIX: Explicitly cast frontmatter data to ensure they are plain strings,
  // preventing any complex objects from causing serialization errors.
  const bookData: Book = {
    slug,
    title: String(matterResult.data.title),
    coverImage: String(matterResult.data.coverImage),
    chapters,
  };

  return bookData;
}
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
    // This check is still important to prevent errors from hidden system files.
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

  const parsedChapters = chaptersHtml.map((chapterHtml) => {
    const titleMatch = chapterHtml.match(/^(.*?)<\/h2>/);
    const title = titleMatch ? titleMatch[1] : 'Untitled Chapter';
    const content = chapterHtml.substring(titleMatch ? titleMatch[0].length : 0).trim();
    
    return { title, content };
  });

  // THE DEFINITIVE FIX:
  // Create a new, completely clean "plain" JavaScript object.
  // This explicitly copies only the primitive data we need and discards any
  // complex prototypes or hidden properties from the parsing process that
  // were causing the serialization error during the build.
  const cleanBookObject: Book = {
    slug: slug,
    title: matterResult.data.title,
    coverImage: matterResult.data.coverImage,
    chapters: parsedChapters.map(chapter => ({
      title: chapter.title,
      content: chapter.content
    }))
  };

  return cleanBookObject;
}
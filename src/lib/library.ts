import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import type { Book } from '../types';

// THE FIX: Point to the 'content' directory in the project root, not inside 'src'.
const booksDirectory = path.join(process.cwd(), 'content/books');

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
  const contentHtml = processedContent.toString();

  const chaptersHtml = contentHtml.split(/<h2.*?>/);
  chaptersHtml.shift(); 

  const chapters = chaptersHtml.map((chapterHtml) => {
    const titleMatch = chapterHtml.match(/^(.*?)<\/h2>/);
    const title = titleMatch ? titleMatch[1] : 'Untitled Chapter';
    const content = chapterHtml.substring(titleMatch ? titleMatch[0].length : 0).trim();
    
    return { title, content };
  });

  return {
    slug,
    title: matterResult.data.title,
    coverImage: matterResult.data.coverImage,
    chapters,
  };
}
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export interface Book {
  slug: string;
  title: string;
  coverImage: string;
  chapters: {
    title: string;
    content: string;
  }[];
}

const booksDirectory = path.join(process.cwd(), 'src/content/books');

export function getAllBooks(): Book[] {
  // Get all entry names (files and folders) in the books directory
  const allEntries = fs.readdirSync(booksDirectory);

  // THE FIX: Filter the list to include ONLY directories, ignoring any files.
  const bookSlugs = allEntries.filter(entry => {
    const fullPath = path.join(booksDirectory, entry);
    // Use fs.statSync to get information about the entry and check if it's a directory
    return fs.statSync(fullPath).isDirectory();
  });

  // Now, map over the clean list of actual book directories
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
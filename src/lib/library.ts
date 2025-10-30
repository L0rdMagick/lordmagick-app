import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Define the shape of our Book data, same as before
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
  // Get all the folder names under src/content/books
  const bookSlugs = fs.readdirSync(booksDirectory);

  const allBooksData = bookSlugs.map((slug) => {
    // For each slug, get the full book data
    return getBookBySlug(slug);
  });

  return allBooksData;
}

export function getBookBySlug(slug: string): Book {
  const fullPath = path.join(booksDirectory, slug, 'index.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  // We process the entire book content at once.
  const processedContent = remark()
    .use(html)
    .processSync(matterResult.content);
  const contentHtml = processedContent.toString();

  // Split the HTML content by h2 tags to create chapters
  const chaptersHtml = contentHtml.split(/<h2.*?>/);
  chaptersHtml.shift(); // Remove the first empty element

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
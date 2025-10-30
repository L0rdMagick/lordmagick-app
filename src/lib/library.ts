import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { notFound } from 'next/navigation';

// Define the structure of a Chapter and a Book
export interface Chapter {
  title: string;
  content: string; // Content is expected to be HTML
}

export interface Book {
  slug: string;
  title: string;
  coverImage: string;
  chapters: Chapter[];
}

// Point to the directory where you store your book content
const booksDirectory = path.join(process.cwd(), '_books');

/**
 * Parses a Markdown book file's content into a Book object.
 */
async function parseBookFile(slug: string, fileContents: string): Promise<Book> {
  const { data, content } = matter(fileContents);

  // Dynamically find the cover image based on the slug
  const coverImageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
  let coverImage = '/images/books/default-cover.png'; // A fallback
  for (const ext of coverImageExtensions) {
    const potentialCover = path.join(process.cwd(), `public/images/books/${slug}.${ext}`);
    if (fs.existsSync(potentialCover)) {
      coverImage = `/images/books/${slug}.${ext}`;
      break;
    }
  }

  // Split the book content by H2 headings to create chapters
  const chapterHeadings = content.split('\n## ');
  const chapters: Chapter[] = [];

  // Remove the first element if it's empty (from the frontmatter)
  if (chapterHeadings[0].trim() === '') {
    chapterHeadings.shift();
  }

  for (const chapterText of chapterHeadings) {
    if (chapterText.trim() === '') continue;

    const lines = chapterText.split('\n');
    const title = lines[0].trim();
    const chapterContentRaw = lines.slice(1).join('\n');

    // Convert chapter markdown to HTML
    const processedContent = await remark().use(html).process(chapterContentRaw);
    const contentHtml = processedContent.toString();
    chapters.push({ title, content: contentHtml });
  }
  
  if (!data.title) {
    throw new Error(`Book "${slug}" is missing a 'title' in its metadata.`);
  }

  return {
    slug,
    title: data.title,
    coverImage,
    chapters,
  };
}

/**
 * Gets all available books from the filesystem.
 */
export async function getAllBooks(): Promise<Book[]> {
  const fileNames = fs.readdirSync(booksDirectory).filter(file => file.endsWith('.md'));
  
  const allBooksData = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(booksDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      return parseBookFile(slug, fileContents);
    })
  );

  return allBooksData;
}

/**
 * Gets a single book by its slug.
 */
export async function getBookBySlug(slug: string): Promise<Book | null> {
    const fullPath = path.join(booksDirectory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }
  
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const book = await parseBookFile(slug, fileContents);
    return book;
}
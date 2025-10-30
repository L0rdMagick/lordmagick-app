import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

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

// Point to the new directory where you'll store your book content
const booksDirectory = path.join(process.cwd(), '_books');

/**
 * Parses a Markdown file into a Book object.
 * @param slug - The unique identifier for the book (from its filename).
 * @param fileContents - The raw string content of the markdown file.
 * @returns A promise that resolves to the fully parsed Book object.
 */
async function parseBookFile(slug: string, fileContents: string): Promise<Book> {
  // Use gray-matter to parse the book's metadata (frontmatter)
  const { data, content } = matter(fileContents);

  // Find the corresponding cover image in the public directory
  const coverImageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
  let coverImage = '/images/books/default-cover.png'; // A fallback cover
  for (const ext of coverImageExtensions) {
    if (fs.existsSync(path.join(process.cwd(), `public/images/books/${slug}.${ext}`))) {
      coverImage = `/images/books/${slug}.${ext}`;
      break;
    }
  }

  // --- Chapter Parsing Logic ---
  // Split the book content into chapters using H2 headings (##) as delimiters
  const chapterHeadings = content.split('\n## ');
  const chapters: Chapter[] = [];

  for (const chapterText of chapterHeadings) {
    if (chapterText.trim() === '') continue;

    const lines = chapterText.split('\n');
    const title = lines[0].trim();
    const chapterContentRaw = lines.slice(1).join('\n');

    // Convert the Markdown content of the chapter into HTML
    const processedContent = await remark().use(html).process(chapterContentRaw);
    const contentHtml = processedContent.toString();

    chapters.push({ title, content: contentHtml });
  }
  
  // Ensure required metadata is present
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
 * This function reads all .md files from the _books directory,
 * parses each one, and returns them as an array of Book objects.
 */
async function getAllBooks(): Promise<Book[]> {
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

// Export the dynamically generated list of books
export const libraryBooks: Book[] = await getAllBooks();
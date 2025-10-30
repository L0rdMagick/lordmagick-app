import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { Book } from '@/types';

const booksDirectory = path.join(process.cwd(), 'src/content/books');

// This function must return a Promise of an array of Books
export async function getAllBooks(): Promise<Book[]> {
  const allEntries = fs.readdirSync(booksDirectory);
  const bookSlugs = allEntries.filter(entry => {
    const fullPath = path.join(booksDirectory, entry);
    return fs.statSync(fullPath).isDirectory();
  });
  
  // We use Promise.all to wait for all the async getBookBySlug calls to complete
  const allBooksData = await Promise.all(bookSlugs.map(slug => getBookBySlug(slug)));
  return allBooksData;
}

// This function must also return a Promise of a single Book
export async function getBookBySlug(slug: string): Promise<Book> {
  const fullPath = path.join(booksDirectory, slug, 'index.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  // Destructure with fallbacks immediately to prevent undefined data
  const { data, content } = matter(fileContents);
  
  // Await the async parsing from 'marked'
  const rawHtml = await marked.parse(content || ''); // Use `|| ''` as a safeguard

  const chapters: { title: string; content: string }[] = [];
  
  // Split by the H2 tag, keeping the delimiter in the resulting array
  const parts = rawHtml.split(/(<h2[^>]*>.*?<\/h2>)/);
  
  // The first element is content before the first H2, which we discard if it exists
  if (parts.length > 1) {
    parts.shift();
  }

  // Iterate over the parts in pairs (title, content)
  for (let i = 0; i < parts.length; i += 2) {
    const titleHtml = parts[i];
    const contentHtml = parts[i + 1] || ''; // Safeguard against missing content
    
    // Extract pure text from the H2 tag
    const chapterTitle = titleHtml.replace(/<[^>]+>/g, '').trim();
    
    // Only add the chapter if a valid title was found
    if (chapterTitle) {
      chapters.push({
        title: chapterTitle,
        content: contentHtml.trim()
      });
    }
  }

  // THE DEFINITIVE FIX:
  // Manually construct a new, "clean" object. This is the most important step.
  // We explicitly cast every value to ensure it's a primitive string and
  // that the final object is 100% plain and serializable.
  const cleanBook: Book = {
    slug: String(slug),
    title: String(data.title || 'Untitled Book'),
    coverImage: String(data.coverImage || ''),
    chapters: chapters.map(ch => ({
      title: String(ch.title),
      content: String(ch.content)
    }))
  };

  return cleanBook;
}
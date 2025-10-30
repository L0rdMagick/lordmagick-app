import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { Book } from '@/types';

const booksDirectory = path.join(process.cwd(), 'src/content/books');

export async function getAllBooks(): Promise<Book[]> {
  const allEntries = fs.readdirSync(booksDirectory);
  const bookSlugs = allEntries.filter(entry => {
    const fullPath = path.join(booksDirectory, entry);
    return fs.statSync(fullPath).isDirectory();
  });
  
  const allBooksData = await Promise.all(bookSlugs.map(slug => getBookBySlug(slug)));
  return allBooksData;
}

export async function getBookBySlug(slug: string): Promise<Book> {
  const fullPath = path.join(booksDirectory, slug, 'index.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Use marked to convert markdown to HTML. It returns a simple string.
  const contentHtml = await marked.parse(content);

  // THE DEFINITIVE FIX: A new, robust chapter parsing algorithm.
  const chapters: { title: string; content: string }[] = [];
  
  // The regex now splits the content BY the h2 tag, keeping the tag in the results.
  const chapterParts = contentHtml.split(/(<h2[^>]*>.*?<\/h2>)/);

  // The first element is any content BEFORE the first chapter heading. We discard it.
  if (chapterParts.length > 1) {
    chapterParts.shift(); 
  }

  // We now have an array like [ '<h2>Title 1</h2>', '<p>Content 1</p>', '<h2>Title 2</h2>', '<p>Content 2</p>', ... ]
  // We can iterate through it in pairs.
  for (let i = 0; i < chapterParts.length; i += 2) {
    const titleHtml = chapterParts[i];
    const contentHtmlFragment = chapterParts[i + 1] || ''; // Ensure content is at least an empty string

    // Extract the text from the <h2> tag for the title.
    const title = titleHtml.replace(/<[^>]+>/g, '').trim(); 
    
    if (title) { // Only add the chapter if a title was successfully extracted.
      chapters.push({ title, content: contentHtmlFragment.trim() });
    }
  }

  const bookData: Book = {
    slug: slug,
    title: data.title || 'Untitled Book',
    coverImage: data.coverImage || '',
    chapters: chapters,
  };

  // The JSON.parse trick is a final "purification" step to ensure 100% serializable data.
  return JSON.parse(JSON.stringify(bookData));
}
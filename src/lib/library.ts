import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// --- TYPE DEFINITIONS ---
// This is the summary used by the bookshelf page.
export interface BookSummary {
  slug: string;
  title: string;
  coverImage: string;
}

// --- FUNCTION FOR THE BOOKSHELF PAGE ---
// This function reads all book files and returns their summary data.
export function getAllBooks(): BookSummary[] {
  const booksDirectory = path.join(process.cwd(), 'src', 'books');
  const fileNames = fs.readdirSync(booksDirectory).filter(file => file.endsWith('.md'));

  const allBooksData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(booksDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents); // We only need the metadata (title)

    // Find the corresponding cover image
    const coverImageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    let coverImage = '/images/books/default-cover.png'; // A fallback
    for (const ext of coverImageExtensions) {
      if (fs.existsSync(path.join(process.cwd(), `public/images/books/${slug}.${ext}`))) {
        coverImage = `/images/books/${slug}.${ext}`;
        break;
      }
    }

    return {
      slug,
      title: data.title as string,
      coverImage,
    };
  });

  return allBooksData;
}

// --- FUNCTION FOR THE SINGLE BOOK PAGE ---
// This function reads and fully parses one book file into HTML.
export async function getBookHtmlContent(slug: string) {
  const booksDirectory = path.join(process.cwd(), 'src', 'books');
  const fullPath = path.join(booksDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    title: data.title as string,
    content: contentHtml,
  };
}
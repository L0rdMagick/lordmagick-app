import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Type for the book summary used on the bookshelf page.
export interface BookSummary {
  slug: string;
  title: string;
  coverImage: string;
}

// Function for the bookshelf page: gets a list of all books.
export function getAllBooks(): BookSummary[] {
  const booksDirectory = path.join(process.cwd(), 'src', 'books');
  const fileNames = fs.readdirSync(booksDirectory).filter(file => file.endsWith('.md'));

  const allBooksData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(booksDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    const coverImageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    let coverImage = '/images/books/default-cover.png';
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

// Function for the single book page: gets the full HTML content of one book.
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
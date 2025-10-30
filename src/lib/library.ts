import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export interface Chapter {
  title: string;
  content: string;
}

export interface Book {
  slug: string;
  title: string;
  coverImage: string;
  chapters: Chapter[];
}

const booksDirectory = path.join(process.cwd(), 'src', 'books');

// This function now has extensive error handling and logging for Vercel.
export async function getAllBooks(): Promise<Book[]> {
  console.log("--- Starting getAllBooks ---");
  try {
    console.log(`[DEBUG] Current Working Directory: ${process.cwd()}`);
    console.log(`[DEBUG] Target Directory Path: ${booksDirectory}`);

    // Check if the 'src' directory itself exists
    const srcPath = path.join(process.cwd(), 'src');
    if (!fs.existsSync(srcPath)) {
        console.error("[ERROR] The 'src' directory does not exist. Build environment is incorrect.");
        return [];
    }
    console.log(`[SUCCESS] Found 'src' directory. Contents:`, fs.readdirSync(srcPath));

    // Check if the target 'books' directory exists
    if (!fs.existsSync(booksDirectory)) {
      console.error(`[ERROR] The target directory ${booksDirectory} was NOT FOUND.`);
      return [];
    }
    console.log(`[SUCCESS] Found target directory: ${booksDirectory}`);

    const fileNames = fs.readdirSync(booksDirectory).filter(file => file.endsWith('.md'));
    console.log(`[INFO] Found markdown files in directory:`, fileNames);

    if (fileNames.length === 0) {
      console.warn("[WARNING] The 'books' directory exists, but it is empty or contains no .md files.");
      return [];
    }

    const allBooksData = await Promise.all(
      fileNames.map(fileName => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(booksDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        return parseBookFile(slug, fileContents);
      })
    );

    console.log("--- Finished getAllBooks Successfully ---");
    return allBooksData;

  } catch (error) {
    console.error("[CRITICAL ERROR] An unexpected error occurred in getAllBooks:", error);
    return []; // Return an empty array on failure
  }
}

// No changes needed for the functions below, but they are included for completeness.
export async function getBookBySlug(slug: string): Promise<Book | null> {
    const fullPath = path.join(booksDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return parseBookFile(slug, fileContents);
}

async function parseBookFile(slug: string, fileContents: string): Promise<Book> {
  const { data, content } = matter(fileContents);
  const coverImageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
  let coverImage = '/images/books/default-cover.png';
  for (const ext of coverImageExtensions) {
    if (fs.existsSync(path.join(process.cwd(), `public/images/books/${slug}.${ext}`))) {
      coverImage = `/images/books/${slug}.${ext}`;
      break;
    }
  }
  const chapterHeadings = content.split('\n## ').filter(c => c.trim() !== '');
  const chapters: Chapter[] = await Promise.all(
      chapterHeadings.map(async (chapterText) => {
          const lines = chapterText.split('\n');
          const title = lines[0].trim();
          const chapterContentRaw = lines.slice(1).join('\n');
          const processedContent = await remark().use(html).process(chapterContentRaw);
          return { title, content: processedContent.toString() };
      })
  );
  if (!data.title) throw new Error(`Book "${slug}" is missing a title.`);
  return { slug, title: data.title, coverImage, chapters };
}
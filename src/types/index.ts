// This file will hold all shared type definitions for our application.

export interface Book {
  slug: string;
  title: string;
  coverImage: string;
  chapters: {
    title:string;
    content: string;
  }[];
}
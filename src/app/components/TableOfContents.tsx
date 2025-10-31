"use client";

import { useEffect, useState } from 'react';

interface TableOfContentsProps {
  content: string;
  onChapterSelect: (chapterId: string) => void;
}

interface Chapter {
  id: string;
  title: string;
}

export default function TableOfContents({ content, onChapterSelect }: TableOfContentsProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h2'));
    const chapterData = headings.map((heading, index) => {
      const id = `chapter-${index}`;
      heading.id = id;
      return { id, title: heading.textContent || '' };
    });
    setChapters(chapterData);
  }, [content]);

  return (
    <div className="absolute top-0 left-0 -translate-x-full h-full p-4">
        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Chapters</h3>
            <ul className="space-y-2">
                {chapters.map(chapter => (
                    <li key={chapter.id}>
                        <button
                            onClick={() => onChapterSelect(chapter.id)}
                            className="text-gray-300 hover:text-amber-200 transition-colors"
                        >
                            {chapter.title}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
}
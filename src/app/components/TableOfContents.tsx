/// <reference lib="dom" />
"use client";

// --- START OF FILE src/app/components/TableOfContents.tsx ---

export interface Chapter {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  chapters: Chapter[];
  isOpen: boolean;
  onClose: () => void;
}

export default function TableOfContents({ chapters, isOpen, onClose }: TableOfContentsProps) {

  const handleChapterClick = (chapterId: string) => {
    // FIX: Safe document access via globalThis to prevent SSR build errors
    const doc = (globalThis as any).document;
    if (doc) {
        const chapterElement = doc.getElementById(chapterId);
        if (chapterElement) {
          chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover p-6 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          boxShadow: '4px 0px 15px rgba(0,0,0,0.5)'
        }}
      >
        <h3 className="text-2xl font-bold text-black mb-6 border-b-2 border-gray-500/50 pb-3">
          Contents
        </h3>
        
        {chapters.length > 0 ? (
          <ul className="space-y-3">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <button
                  onClick={() => handleChapterClick(chapter.id)}
                  className="text-left text-gray-800 hover:text-black font-semibold transition-colors duration-200"
                >
                  {chapter.title}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No chapters found.</p>
        )}
      </div>
    </>
  );
}
"use client";

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
    const chapterElement = document.getElementById(chapterId);
    if (chapterElement) {
      chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        // THE FIX: Changed background to light parchment to match the book
        className={`fixed top-0 left-0 h-full w-72 bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover p-6 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          boxShadow: '4px 0px 15px rgba(0,0,0,0.5)'
        }}
      >
        {/* THE FIX: Changed text and border to be dark and bold */}
        <h3 className="text-2xl font-bold text-black mb-6 border-b-2 border-gray-500/50 pb-3">
          Contents
        </h3>
        
        {chapters.length > 0 ? (
          <ul className="space-y-3">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <button
                  onClick={() => handleChapterClick(chapter.id)}
                  // THE FIX: Changed chapter text to be dark and bold
                  className="text-left text-gray-800 hover:text-black font-semibold transition-colors duration-200"
                >
                  {chapter.title}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          // THE FIX: Adjusted "no chapters" text for the light background
          <p className="text-gray-600">No chapters found.</p>
        )}
      </div>
    </>
  );
}
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
      // The element exists in the document, now we just need to scroll to it.
      // The BookReader component will handle the actual scrolling logic.
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
        className={`fixed top-0 left-0 h-full w-72 bg-[#1a110a] bg-[url('/images/books/parchment-bg.png')] bg-cover p-6 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          boxShadow: '4px 0px 15px rgba(0,0,0,0.5)'
        }}
      >
        <h3 className="text-2xl font-bold text-amber-200 mb-6 border-b border-amber-200/20 pb-2">
          Contents
        </h3>
        {chapters.length > 0 ? (
          <ul className="space-y-3">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <button
                  onClick={() => handleChapterClick(chapter.id)}
                  className="text-left text-gray-300 hover:text-amber-100 transition-colors duration-200"
                >
                  {chapter.title}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No chapters found.</p>
        )}
      </div>
    </>
  );
}
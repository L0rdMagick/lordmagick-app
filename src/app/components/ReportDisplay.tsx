// --- START OF FILE src/app/components/ReportDisplay.tsx ---

import React, { useMemo, MouseEvent } from 'react';
import { BackToTopIcon } from './icons';

interface ReportDisplayProps {
  reportContent: string;
}

interface ParsedContent {
    type: 'p' | 'li' | 'back-to-top' | 'h3' | 'h4';
    text: string;
    href?: string;
}

interface ReportSection {
    id: string;
    title: string;
    image?: string;
    content: ParsedContent[];
}

const imageMap: Record<string, string> = {
    'introduction-your-personal-blueprint': '/images/reports/introduction.jpg',
    'core-essence-type-strategy-and-authority': '/images/reports/core-essence.jpg',
    'your-role-personality-the-profile': '/images/reports/profile.jpg',
    'energy-centers-your-energetic-makeup': '/images/reports/energy-centers.jpg',
    'your-gifts-and-lifeforce-gates-and-channels': '/images/reports/gifts.jpg',
    'your-lifes-purpose-the-incarnation-cross': '/images/reports/purpose.jpg',
    'career-and-vocation-thriving-in-your-work': '/images/reports/career.jpg',
    'relationships-and-connection-the-design-of-your-heart': '/images/reports/relationships.jpg',
    'challenges-the-not-self-theme-your-path-to-growth': '/images/reports/challenges.jpg',
    'living-your-design-a-practical-guide': '/images/reports/living.jpg',
};

const ReportDisplay: React.FC<ReportDisplayProps> = ({ reportContent }) => {

  const { coverData, sections } = useMemo(() => {
    if (!reportContent) return { coverData: {}, sections: [] };

    const parts = reportContent.split('---');
    const coverContent = parts[0] || '';
    const mainContent = parts[1] || '';

    const cover: Record<string, string> = {};
    coverContent.split('\n').forEach(line => {
      const match = line.match(/^(.*?):\s*(.*)$/);
      if (match) {
        cover[match[1].toLowerCase().trim()] = match[2].trim();
      }
    });

    // --- THE FIX: NEW ROBUST MARKDOWN PARSING LOGIC ---
    const parsedSections: ReportSection[] = [];
    let currentSection: ReportSection | null = null;
    const lines = mainContent.split('\n').filter(line => line.trim() !== '');

    const createIdFromTitle = (title: string) => {
        return title.toLowerCase()
            .replace(/\d+\.\s*/, '') // Remove numbering like "1. "
            .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters
            .trim()
            .replace(/\s+/g, '-'); // Replace spaces with hyphens
    };

    for (const line of lines) {
        if (line.startsWith('## ')) {
            if (currentSection) {
                parsedSections.push(currentSection);
            }
            const title = line.substring(3).replace(/^\d+\.\s*/, '').trim();
            const id = createIdFromTitle(title);
            currentSection = { id, title, content: [], image: imageMap[id] };
        } else if (currentSection) {
            const tocItemMatch = line.match(/^\s*-\s*\[(.*?)]\((.*?)\)/);
            const backToTopMatch = line.match(/\[Back to Top\]\((.*?)\)/);

            if (tocItemMatch) {
                currentSection.content.push({ type: 'li', text: tocItemMatch[1], href: tocItemMatch[2] });
            } else if (backToTopMatch) {
                currentSection.content.push({ type: 'back-to-top', text: 'Back to Top', href: backToTopMatch[1] });
            } else if (line.startsWith('#### ')) {
                currentSection.content.push({ type: 'h4', text: line.substring(5) });
            } else if (line.startsWith('### ')) {
                currentSection.content.push({ type: 'h3', text: line.substring(4) });
            } else {
                currentSection.content.push({ type: 'p', text: line });
            }
        }
    }

    if (currentSection) {
        parsedSections.push(currentSection);
    }
    // --- END FIX ---
    
    return { coverData: cover, sections: parsedSections };

  }, [reportContent]);

  const handleInternalLinkClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');

    if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
      const id = anchor.getAttribute('href')!.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  
  return (
    <div className="animate-fade-in space-y-4">
      <div onClick={handleInternalLinkClick} className="bg-[#0a092d] p-4 sm:p-8 rounded-lg">
        <div id="cover-page" className="text-center flex flex-col items-center justify-center min-h-screen py-16">
              <div className="border-4 border-purple-400/50 p-6 sm:p-8 rounded-lg max-w-3xl">
                  <h1 className="text-4xl sm:text-5xl font-bold font-serif text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-500 mb-4">{coverData.title}</h1>
                  <p className="text-2xl text-gray-200 font-serif mb-8">For {coverData.name}</p>
                  <p className="text-xl italic text-purple-300 max-w-2xl mx-auto mb-8">"{coverData.subtitle}"</p>
                  <p className="text-md text-gray-400 max-w-2xl mx-auto">{coverData.description}</p>
              </div>
        </div>
        
        <div>
            {sections.map(section => (
                <div key={section.id} id={section.id} className="py-8 scroll-mt-20">
                     <h2 className="text-3xl font-bold font-serif text-purple-300 mt-12 mb-6 border-b-2 border-purple-400/50 pb-2">{section.title}</h2>
                     {section.image && <img src={section.image} alt={section.title} className="rounded-lg my-6 w-full h-64 object-cover shadow-lg" loading="lazy" />}
                     
                     {section.id.includes('table-of-contents') ? (
                        <ul className="list-none p-0 space-y-3">
                            {section.content.map((item, index) => (
                                item.type === 'li' &&
                                <li key={index}>
                                    <a href={item.href} className="text-lg text-gray-300 transition-colors duration-200 hover:text-purple-400">{item.text}</a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        section.content.map((item, index) => {
                            switch(item.type) {
                                case 'p': {
                                    const parts = item.text.split(/(\*\*.*?\*\*)/g);
                                    return (
                                        <p key={index} className="text-gray-300 my-4 leading-relaxed">
                                            {parts.map((part, i) => 
                                                part.startsWith('**') && part.endsWith('**') 
                                                    ? <strong key={i} className="text-gray-100 font-bold">{part.slice(2, -2)}</strong> 
                                                    : part
                                            )}
                                        </p>
                                    );
                                }
                                case 'h3':
                                    return <h3 key={index} className="text-2xl font-bold font-serif text-purple-300 mt-8 mb-4">{item.text}</h3>;
                                case 'h4':
                                    return <h4 key={index} className="text-xl font-bold font-serif text-gray-100 mt-6 mb-2">{item.text}</h4>;
                                case 'back-to-top':
                                    return (
                                       <div key={index} className="text-center mt-8">
                                           <a href={item.href} className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                                               <BackToTopIcon />
                                               {item.text}
                                           </a>
                                       </div>
                                    );
                                default:
                                    return null;
                            }
                        })
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ReportDisplay;
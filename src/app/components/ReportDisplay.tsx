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
    'introduction': '/images/reports/introduction.jpg',
    'intro': '/images/reports/introduction.jpg',
    'your-core-energetic-blueprint-the-manifesting-generator': '/images/reports/core-essence.jpg',
    'mg_type': '/images/reports/core-essence.jpg',
    'your-operational-guidance-strategy-authority': '/images/reports/profile.jpg',
    'strategy_authority': '/images/reports/profile.jpg',
    'your-lifes-purpose-perspective-the-profile-6-6': '/images/reports/profile.jpg',
    'profile_6_6': '/images/reports/profile.jpg',
    'your-lifes-theme-the-right-angle-cross-of-duality-30-29-20-34': '/images/reports/purpose.jpg',
    'incarnation_cross': '/images/reports/purpose.jpg',
    'your-energetic-centers-defined-undefined': '/images/reports/energy-centers.jpg',
    'centers': '/images/reports/energy-centers.jpg',
    'integration-practical-application': '/images/reports/living.jpg',
    'integration': '/images/reports/living.jpg',
};

const createIdFromTitle = (title: string): string => {
    return title.toLowerCase()
        .replace(/\d+\.\s*/, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
};

const ReportDisplay: React.FC<ReportDisplayProps> = ({ reportContent }) => {

  const { coverData, sections } = useMemo(() => {
    if (!reportContent) return { coverData: {}, sections: [] };

    // --- THE FIX: Correctly split the report into its distinct parts ---
    const parts = reportContent.split('---');
    if (parts.length < 2) return { coverData: {}, sections: [] }; // Not a valid report format

    const coverContent = parts[0] || '';
    // Everything after the first '---' is considered the body for parsing sections
    const mainBodyContent = parts.slice(1).join('---'); 

    const cover: Record<string, string> = {};
    coverContent.split('\n').forEach(line => {
      const match = line.match(/^(.*?):\s*(.*)$/);
      if (match) {
        cover[match[1].toLowerCase().trim()] = match[2].trim();
      }
    });

    const parsedSections: ReportSection[] = [];
    const contentBlocks = mainBodyContent.split(/(?=^##\s)/m).filter(block => block.trim() !== '');

    for (const block of contentBlocks) {
        const lines = block.split('\n').filter(line => line.trim() !== '');
        const headerLine = lines.shift() || '';

        const oldIdMatch = headerLine.match(/\{#(.*?)\}/);
        const titleText = headerLine.replace(/\{#.*?\}/, '').replace(/^##\s*/, '').trim();
        const id = oldIdMatch ? oldIdMatch[1] : createIdFromTitle(titleText);
        
        const currentSection: ReportSection = { id, title: titleText, content: [], image: imageMap[id] };
        
        for (const line of lines) {
            const tocItemMatch = line.match(/^\s*-\s*\[(.*?)]\((.*?)\)|\d\.\s*\[(.*?)]\((.*?)\)/); // Handles both bullet and numbered lists
            const backToTopMatch = line.match(/\[Back to Top\]\((.*?)\)/);
            
            if (tocItemMatch) {
                // tocItemMatch will have groups [1, 2] for '-' lists or [3, 4] for '1.' lists
                currentSection.content.push({ type: 'li', text: tocItemMatch[1] || tocItemMatch[3], href: tocItemMatch[2] || tocItemMatch[4] });
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
                     <h2 className="text-3xl font-bold font-serif text-purple-300 mt-12 mb-6 border-b-2 border-purple-400/50 pb-2">{section.title.replace(/^\d+\.\s*/, '')}</h2>
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
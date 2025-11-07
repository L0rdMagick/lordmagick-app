"use client";

import Link from 'next/link';

interface MagickalBackLinkProps {
  href: string;
  text: string;
  className?: string;
}

const MagickalBackLink: React.FC<MagickalBackLinkProps> = ({ href, text, className }) => (
    <Link 
      href={href}
      className={`group flex items-center gap-3 text-cyan-200 opacity-80 hover:opacity-100 transition-all duration-300 ${className}`}
      style={{ filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.7))' }}
    >
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="transition-transform group-hover:-translate-x-1"
        >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
        </svg>
        <span className="font-semibold tracking-wider group-hover:text-white">
            {text}
        </span>
    </Link>
);

export default MagickalBackLink;
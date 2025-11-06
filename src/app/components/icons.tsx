// --- START OF FILE src/components/icons.tsx ---

import React from 'react';

export const HeaderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
        <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />
        <path d="M2 12h20" />
        <path d="M12 22V2" />
    </svg>
);

export const SubmitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
);

export const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export const BackToTopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a.75.75 0 01-.75-.75V4.81L6.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06L10.75 4.81v12.44A.75.75 0 0110 18z" clipRule="evenodd" />
    </svg>
);

export const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm10.293 9.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 17H7a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);

interface IconProps {
    className?: string;
}

export const LockIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);

export const WandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 12l5 5 10-10-5-5z" />
        <path d="M2 22l5-5" />
        <path d="M18 6l-5 5" />
        <path d="M21 3l-3 3" />
        <path d="M15 9l-3 3" />
    </svg>
);

export const GrimoireFlourish: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 80C30 70 40 40 20 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M80 20C70 30 60 60 80 80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 50C35 45 65 45 80 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);

export const GrimoireDecoration: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 400 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 15 H 60 C 70 25, 90 25, 100 15 C 110 5, 130 5, 140 15 L 160 15 C 170 25, 190 25, 200 15 C 210 5, 230 5, 240 15 L 260 15 C 270 25, 290 25, 300 15 C 310 5, 330 5, 340 15 H 398" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M2 15 H 60 C 70 5, 90 5, 100 15 C 110 25, 130 25, 140 15 L 160 15 C 170 5, 190 5, 200 15 C 210 25, 230 25, 240 15 L 260 15 C 270 5, 290 5, 300 15 C 310 25, 330 25, 340 15 H 398" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

export const StoneTabletButton: React.FC<{children: React.ReactNode, onClick: () => void, className?: string}> = ({ children, onClick, className }) => (
    <button onClick={onClick} className={`relative group transition-transform duration-200 hover:-translate-y-1 ${className}`}>
        <svg className="w-full h-full" viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.1 5.3L139.9 11.5C141.5 11.7 142.7 13.2 142.5 14.8L135.9 46.8C135.7 48.4 134.2 49.6 132.6 49.4L3.8 43.2C2.2 43 1 41.5 1.2 39.9L7.8 7.9C8 6.3 9.5 5.1 11.1 5.3Z" 
                  fill="url(#stone-fill)"
                  stroke="url(#stone-stroke)"
                  strokeWidth="1.5"
            />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-engraved font-serif text-purple-200">
            {children}
        </div>
         <defs>
            <linearGradient id="stone-fill" x1="0" y1="0" x2="0" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2c2a58" />
                <stop offset="1" stopColor="#1e1c42" />
            </linearGradient>
             <linearGradient id="stone-stroke" x1="0" y1="0" x2="150" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5f5da8" />
                <stop offset="1" stopColor="#4f4c92" />
            </linearGradient>
        </defs>
    </button>
);

export const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
);

export const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

export const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

export const CandleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 18h6v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2Z"/>
        <path d="M12 2v4"/>
        <path d="M10 6c0-1.1.9-2 2-2s2 .9 2 2-1.14 2.29-2 3C11.14 8.29 10 7.1 10 6Z"/>
    </svg>
);

export const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300">
        <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 18l1.9-5.8 5.8-1.9-5.8-1.9L12 3z"/>
        <path d="M5 3v4"/>
        <path d="M19 17v4"/>
        <path d="M3 5h4"/>
        <path d="M17 19h4"/>
    </svg>
);

export const AthameIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 15-5-5"/>
        <path d="M16 12 7 3"/>
        <path d="M17 8 8 17"/>
        <path d="M14 21h4v-4"/>
    </svg>
);

export const ChaliceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V8"/>
        <path d="M5 8h14"/>
        <path d="M5 8a7 7 0 0 0 14 0"/>
    </svg>
);

export const PentagramIcon: React.FC<IconProps & { isTracing: boolean }> = ({ className, isTracing }) => (
    <svg viewBox="0 0 100 100" className={className}>
        <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g fill="none" strokeWidth="1">
            {/* The base, dimmer path */}
            <path stroke="currentColor" opacity="0.3" d="M 50, 5 L 61.8, 38.2 L 97.6, 38.2 L 67.9, 58.8 L 79.6, 92 L 50, 71.3 L 20.4, 92 L 32.1, 58.8 L 2.4, 38.2 L 38.2, 38.2 Z M 50,5 A 45 45 0 1 0 49.99 5.001" />
            
            {/* The glowing, animated path */}
            <path 
                className={`pentagram-path ${isTracing ? 'tracing' : ''}`}
                stroke="white"
                filter="url(#glow)"
                d="
                    M 50, 5 
                    L 61.8, 38.2 
                    L 97.6, 38.2 
                    L 67.9, 58.8 
                    L 79.6, 92 
                    L 50, 71.3 
                    L 20.4, 92 
                    L 32.1, 58.8 
                    L 2.4, 38.2 
                    L 38.2, 38.2 
                    Z 
                    M 50,5 
                    A 45 45 0 1 0 49.99 5.001
                "
            />
        </g>
    </svg>
);
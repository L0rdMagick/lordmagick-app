// --- START OF FILE src/app/components/LoadingSpinner.tsx ---

import React from 'react';

// UPDATED: Generic, high-fantasy/occult messages
const messages = [
  "Parting the veil between worlds...",
  "Summoning the ethereal currents...",
  "Weaving the threads of fate...",
  "Whispering to the unseen spirits...",
  "Gathering stardust from the void...",
  "Aligning the ley lines...",
  "Kindling the sacred flame...",
  "Consulting the ancient archives...",
  "Charging the sigils...",
  "Opening the celestial gates..."
];

interface LoadingSpinnerProps {
  title?: string;
  customMessage?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ title = "The Work is in Motion", customMessage }) => {
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    if (customMessage) return; // Don't cycle if a custom message is provided

    const interval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [customMessage]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 min-h-[300px]">
      <div className="w-16 h-16 border-4 border-t-amber-500 border-r-amber-500 border-b-amber-500/30 border-l-amber-500/30 rounded-full animate-spin"></div>
      <p className="text-xl font-semibold text-amber-100 font-serif tracking-wide">{title}</p>
      <p className="text-amber-300/80 transition-opacity duration-500 italic font-light">{customMessage || message}</p>
    </div>
  );
};

export default LoadingSpinner;
import React from 'react';

const messages = [
  "Consulting the cosmic energies...",
  "Translating your unique energetic blueprint...",
  "Aligning the stars for your report...",
  "Uncovering the wisdom of your design...",
  "Crafting your personalized life map..."
];

interface LoadingSpinnerProps {
  title?: string;
  customMessage?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ title = "Generating Your Report", customMessage }) => {
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
      <div className="w-16 h-16 border-4 border-t-purple-500 border-r-purple-500 border-b-purple-500/30 border-l-purple-500/30 rounded-full animate-spin"></div>
      <p className="text-xl font-semibold text-gray-200">{title}</p>
      <p className="text-gray-400 transition-opacity duration-500">{customMessage || message}</p>
    </div>
  );
};

export default LoadingSpinner;
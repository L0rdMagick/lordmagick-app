// src/app/components/PermissionModal.tsx

import React from 'react';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void; // THE FIX: Changed '->' to '=>' for correct TypeScript syntax
}

const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const instructions = {
    ios: [
      "Tap 'aA' in the address bar.",
      "Select 'Website Settings'.",
      "Find 'Microphone' and set it to 'Allow'.",
      "Reload the page.",
    ],
    android: [
      "Tap the Lock icon (🔒) in the address bar.",
      "Select 'Permissions' or 'Site settings'.",
      "Find 'Microphone' and set it to 'Allow'.",
      "Reload the page.",
    ],
  };

  return (
    <>
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-2147483646" // Canonical class fix
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 bg-[#1a1a3d] rounded-xl border border-red-500/50 shadow-2xl z-2147483647"> {/* Canonical class fix */}
        <h2 className="text-2xl font-bold text-red-400 mb-4">Microphone Access Denied</h2>
        <p className="text-gray-300 mb-6">
          The Oracle cannot hear you. To enable your microphone, please follow the steps for your device's browser.
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg text-white">For iPhone (Safari):</h3>
            <ul className="list-decimal list-inside text-gray-400 mt-1">
              {instructions.ios.map(step => <li key={step}>{step}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">For Android (Chrome):</h3>
            <ul className="list-decimal list-inside text-gray-400 mt-1">
              {instructions.android.map(step => <li key={step}>{step}</li>)}
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          I've Checked My Settings
        </button>
      </div>
    </>
  );
};

export default PermissionModal;
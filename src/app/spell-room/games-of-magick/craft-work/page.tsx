"use client";

import React from 'react';

export default function CraftWorkPage() {
    return (
        <div className="w-full h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex items-center justify-center bg-black overflow-hidden relative">
            <iframe 
                src="/games/craft-work.html" 
                className="w-full h-full border-none"
                title="Craft Work: The Alchemist's Path"
                allowFullScreen
            />
        </div>
    );
}

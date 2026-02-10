"use client";

import { useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { StoreContent } from "../../store/page";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function InterceptedStore() {
    const router = useRouter();
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on click outside or escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") router.back();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             {/* Backdrop */}
            <div 
                ref={overlayRef}
                onClick={handleBack}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
            />
            
            {/* Modal Container */}
            <div className="relative z-10 w-full h-full max-w-5xl max-h-[90vh] bg-black/50 overflow-hidden rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 border border-amber-900/40">
                <button 
                    onClick={handleBack}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/60 rounded-full text-white/70 hover:text-white hover:bg-red-900/50 transition-colors"
                >
                    <X size={24} />
                </button>
                
                {/* 
                   Reuse the StoreContent. 
                   Note: StoreContent is full screen by default, so we might need to 
                   constrain it appropriately or let it fill the modal. 
                   Given StoreContent has 'h-screen' on its main element, 
                   it might try to force full height. We'll let it fill our container.
                */}
                <div className="w-full h-full">
                    <Suspense fallback={<div className="h-full flex items-center justify-center"><LoadingSpinner /></div>}>
                        <StoreContent isModal={true} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

"use client";
import MagickalBackLink from '@/app/components/MagickalBackLink';
import ComingSoon from '@/app/components/ComingSoon';

export default function PsychicTrainingPage() {
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8 flex flex-col" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative z-20 mb-10">
            <MagickalBackLink href="/the-magick-psychic-school" text="The School" />
        </div>
        <div className="relative z-10 grow flex items-center justify-center">
            <ComingSoon />
        </div>
    </main>
  );
}
import Link from 'next/link';
import RoomsButton from '../components/RoomsButton'; // THE FIX: Import the button

export default function MarketplacePage() {
  return (
    <div className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* THE FIX: Added a header to contain the title and button */}
      <header className="relative z-10 flex justify-between items-center text-white">
         <h1 className="text-5xl font-serif text-green-400">The Marketplace</h1>
         <RoomsButton />
      </header>
      
      {/* You can add more marketplace content here */}
    </div>
  );
}
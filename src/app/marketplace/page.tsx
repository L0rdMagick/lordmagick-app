import RoomsButton from '../components/RoomsButton';

export default function MarketplacePage() {
  return (
    <div className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* THE FIX: Implemented the responsive header structure */}
      <header className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <h1 className="text-5xl md:text-6xl font-serif text-green-400">The Marketplace</h1>
            <RoomsButton className="ml-0 md:ml-8" />
        </div>
      </header>
      
      {/* You can add more marketplace content here */}
    </div>
  );
}
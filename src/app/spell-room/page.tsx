import Link from 'next/link';
export default function SpellRoomPage() {
  return (
    <div className="bg-black text-white h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-serif text-purple-400">The Spell Room</h1>
      <Link href="/hall" className="mt-4 text-lg hover:underline">Return to the Grand Hall</Link>
    </div>
  );
}
import Link from 'next/link';
export default function OracleRoomPage() {
  return (
    // THE FIX: Changed h-screen to min-h-screen to allow scrolling/refresh.
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-serif text-cyan-400">The Oracle Room</h1>
      <Link href="/hall" className="mt-4 text-lg hover:underline">Return to the Grand Hall</Link>
    </div>
  );
}
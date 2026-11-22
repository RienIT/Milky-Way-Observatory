import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen w-screen bg-[#030406] text-[#ECEAE4] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-[4px] bg-[#0a0c10] border border-white/[0.10] p-7 text-center space-y-4">
        <p className="font-mono text-xs uppercase tracking-widest text-[#E88B38]">
          404 · Deep Space Sector Empty
        </p>
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-[#ECEAE4]">
          Astronomical Coordinates Not Found
        </h1>
        <p className="text-sm text-[#8A8D96] leading-relaxed">
          The path you requested does not exist in the Milky Way Observatory.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-[2px] bg-[#E88B38] hover:bg-[#f09b4e] text-[#050608] text-sm font-semibold transition-colors"
          >
            Return to Milky Way 3D
          </Link>
        </div>
      </div>
    </main>
  );
}

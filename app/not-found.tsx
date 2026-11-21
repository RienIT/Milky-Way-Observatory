import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen w-screen bg-[#090a0d] text-[#f3f4f6] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-[16px] bg-[#111318] border border-white/[0.10] p-7 text-center space-y-4">
        <p className="font-mono text-xs uppercase tracking-widest text-[#54a8ff]">
          404 · Deep Space Sector Empty
        </p>
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-[#f3f4f6]">
          Astronomical Coordinates Not Found
        </h1>
        <p className="text-sm text-[#9ca3af] leading-relaxed">
          The path you requested does not exist in the Milky Way Observatory.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-[10px] bg-[#0082fb] hover:bg-[#0073e0] text-white text-sm font-semibold transition-colors"
          >
            Return to Milky Way 3D
          </Link>
        </div>
      </div>
    </main>
  );
}

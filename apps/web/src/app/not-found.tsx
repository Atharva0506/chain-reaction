import Link from "next/link";

export default function NotFound() {
  return (
    <main className="h-dvh flex flex-col items-center justify-center bg-black">
      <h1 className="text-2xl font-black text-white mb-2">404</h1>
      <p className="text-zinc-500 font-mono text-sm mb-6">Page not found</p>
      <Link
        href="/"
        className="text-sm font-mono text-zinc-400 hover:text-white transition-colors"
      >
        ← Back to Home
      </Link>
    </main>
  );
}

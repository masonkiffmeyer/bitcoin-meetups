import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="text-bitcoin-orange text-sm tracking-widest mb-4">404</div>
      <h1 className="text-3xl text-white font-medium mb-3">Meetup not found</h1>
      <p className="text-ink-secondary text-sm mb-8">
        This meetup isn&apos;t in our directory yet. Think it should be?
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="bg-bitcoin-orange text-bg-dark px-5 py-2.5 rounded text-sm font-medium hover:bg-bitcoin-orangeLight transition-colors"
        >
          Browse directory
        </Link>
        <Link
          href="/submit"
          className="border border-line-soft bg-bg-card px-5 py-2.5 rounded text-sm text-white hover:border-bitcoin-orange transition-colors"
        >
          Submit a meetup
        </Link>
      </div>
    </div>
  );
}

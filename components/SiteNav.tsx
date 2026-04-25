import Link from "next/link";

export default function SiteNav() {
  return (
    <nav className="border-b border-line-subtle bg-bg-dark">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <Link href="/" className="text-white font-medium text-sm tracking-widest">
          BITCOIN IS BETTER
        </Link>
        <div className="flex gap-6 text-sm text-ink-muted">
          <a href="https://www.bitcoinisbetter.org" className="hover:text-bitcoin-orange transition-colors">
            Home
          </a>
          <a href="https://www.bitcoinisbetter.org/learn" className="hover:text-bitcoin-orange transition-colors">
            Learn
          </a>
          <a href="https://www.bitcoinisbetter.org/partners" className="hover:text-bitcoin-orange transition-colors">
            Partners
          </a>
          <Link href="/" className="text-bitcoin-orange font-medium">
            Meetups
          </Link>
          <a href="https://www.bitcoinisbetter.org/about" className="hover:text-bitcoin-orange transition-colors">
            About
          </a>
        </div>
        <a
          href="https://www.bitcoinisbetter.org/donate"
          className="bg-bitcoin-orange text-bg-dark px-4 py-2 rounded text-xs font-medium tracking-wider hover:bg-bitcoin-orangeLight transition-colors"
        >
          DONATE
        </a>
      </div>
    </nav>
  );
}

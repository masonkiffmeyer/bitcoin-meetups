import Link from "next/link";

export default function SiteNav() {
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        <span className="nav-brand-mark">₿</span>
        <span>
          Bitcoin Meetups<span className="nav-brand-sub">· US</span>
        </span>
      </Link>
      <div className="nav-links">
        <a href="https://www.bitcoinisbetter.org">Home</a>
        <a href="https://www.bitcoinisbetter.org/learn">Learn</a>
        <a href="https://www.bitcoinisbetter.org/partners">Partners</a>
        <Link href="/" className="active">Meetups</Link>
        <a href="https://www.bitcoinisbetter.org/about">About</a>
      </div>
      <div className="nav-actions">
        <span className="nav-live">
          <span className="live-dot" />
          LIVE · v2026.04
        </span>
        <Link href="/submit" className="btn btn-primary">
          Submit a meetup
        </Link>
      </div>
    </nav>
  );
}

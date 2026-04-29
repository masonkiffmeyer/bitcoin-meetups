import Link from "next/link";

export default function SiteNav() {
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        <span className="nav-brand-mark">₿</span>
        BITCOIN IS BETTER
      </Link>
      <div className="nav-links">
        <a href="https://www.bitcoinisbetter.org">Home</a>
        <a href="https://www.bitcoinisbetter.org/learn">Learn</a>
        <a href="https://www.bitcoinisbetter.org/partners">Partners</a>
        <Link href="/" className="active">Meetups</Link>
        <a href="https://www.bitcoinisbetter.org/about">About</a>
      </div>
      <div className="nav-actions">
        <a href="https://www.bitcoinisbetter.org/donate" className="btn btn-primary">
          Donate
        </a>
      </div>
    </nav>
  );
}

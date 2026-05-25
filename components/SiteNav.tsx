import Link from "next/link";

export default function SiteNav() {
  return (
    <nav className="bib-nav">
      <a
        href="https://www.bitcoinisbetter.org"
        className="bib-logo"
        aria-label="Bitcoin Is Better"
      >
        <span className="bib-logo-mark">₿</span>
        <span className="bib-logo-text">is better</span>
      </a>
      <div className="bib-nav-right">
        <div className="bib-nav-links">
          <a href="https://www.bitcoinisbetter.org">home</a>
          <a href="https://www.bitcoinisbetter.org/ads">ads</a>
          <a href="https://www.bitcoinisbetter.org/learn">learn</a>
          <a href="https://www.bitcoinisbetter.org/builders">builders</a>
          <a href="https://www.bitcoinisbetter.org/more">more</a>
          <Link href="/" className="active">meetups</Link>
        </div>
        <a
          href="https://www.bitcoinisbetter.org/donate"
          className="bib-donate"
        >
          donate
        </a>
      </div>
    </nav>
  );
}

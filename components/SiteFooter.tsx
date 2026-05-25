import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <div className="footer-brand">
            <span className="nav-brand-mark">₿</span>
            <span>Bitcoin Meetups · US</span>
          </div>
          <p className="footer-desc">
            A community-maintained directory of every in-person bitcoin meetup in the
            United States. Free, open, no logins. <em>Built by bitcoiners, for bitcoiners.</em>
          </p>
          <Link href="/submit" className="btn btn-ghost">
            Submit a meetup
          </Link>
        </div>
        <div className="footer-col">
          <h4>Directory</h4>
          <ul>
            <li><Link href="/">All meetups</Link></li>
            <li><Link href="/submit">Submit a meetup</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="https://www.bitcoinisbetter.org/learn">Learn bitcoin</a></li>
            <li><a href="https://www.bitcoinisbetter.org/partners">Partners</a></li>
            <li><a href="https://www.bitcoinisbetter.org/about">About</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Connect</h4>
          <ul>
            <li><a href="https://www.bitcoinisbetter.org">bitcoinisbetter.org</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>ALBERS USA · NAD83</span>
        <span>NO SIGN-IN · NO TRACKERS · NO PAYWALL</span>
        <span>V2026.04 · © BITCOINISBETTER.ORG</span>
      </div>
    </footer>
  );
}

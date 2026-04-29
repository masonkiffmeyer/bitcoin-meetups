import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <div className="footer-brand">
            <span className="nav-brand-mark">₿</span>
            BITCOIN IS BETTER
          </div>
          <p className="footer-desc">
            Helping people discover and understand bitcoin. This meetup directory is
            maintained as a community resource.
          </p>
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
        <span>© 2026 · BITCOINISBETTER.ORG</span>
        <span>LIVE DIRECTORY · v2026.04</span>
      </div>
    </footer>
  );
}

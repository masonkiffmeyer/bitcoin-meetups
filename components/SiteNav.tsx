"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function SiteNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  return (
    <nav className="bib-nav">
      <a
        href="https://www.bitcoinisbetter.org"
        className="bib-logo"
        aria-label="Bitcoin Is Better"
      >
        <img
          src="/bitcoinisbetter-logo.png"
          alt="Bitcoin Is Better"
          className="bib-logo-img"
        />
      </a>
      <div className="bib-nav-right">
        <div className="bib-nav-links">
          <a href="https://www.bitcoinisbetter.org">home</a>
          <a href="https://app.bitcoinisbetter.org/ads">ads</a>
          <a href="https://app.bitcoinisbetter.org/learn">learn</a>
          <a href="https://www.bitcoinisbetter.org/builders">builders</a>
          <div
            ref={moreRef}
            className="bib-more"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button
              type="button"
              className="bib-more-trigger active"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
            >
              more
            </button>
            {moreOpen && (
              <div className="bib-more-menu" role="menu">
                <a
                  href="https://www.bitcoinisbetter.org/partners"
                  role="menuitem"
                >
                  partners
                </a>
                <Link href="/" role="menuitem" className="active">
                  meetups
                </Link>
                <a
                  href="https://www.bitcoinisbetter.org/about"
                  role="menuitem"
                >
                  about
                </a>
              </div>
            )}
          </div>
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

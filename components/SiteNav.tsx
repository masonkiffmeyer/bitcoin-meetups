"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "https://www.bitcoinisbetter.org", label: "home" },
  { href: "https://app.bitcoinisbetter.org/ads", label: "ads" },
  { href: "https://app.bitcoinisbetter.org/learn", label: "learn" },
  { href: "https://www.bitcoinisbetter.org/builders", label: "builders" },
  { href: "https://www.bitcoinisbetter.org/partners", label: "partners" },
  { href: "https://www.bitcoinisbetter.org/about", label: "about" },
];

export default function SiteNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  // Lock the page behind the mobile sheet, and bail out if the viewport grows
  // past the breakpoint while the sheet is open (rotation, tablet split-view).
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const mq = window.matchMedia("(min-width: 901px)");
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [menuOpen]);

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
          width={220}
          height={44}
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
        <button
          type="button"
          className="bib-burger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="bib-mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={`bib-burger-bars ${menuOpen ? "is-open" : ""}`}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <div
        className={`bib-mobile-scrim ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <div
        id="bib-mobile-menu"
        className={`bib-mobile-menu ${menuOpen ? "open" : ""}`}
        hidden={!menuOpen}
      >
        <Link
          href="/"
          className="bib-mobile-link active"
          onClick={() => setMenuOpen(false)}
        >
          meetups
        </Link>
        {NAV_LINKS.map((l) => (
          <a key={l.label} href={l.href} className="bib-mobile-link">
            {l.label}
          </a>
        ))}
        <Link
          href="/submit"
          className="bib-mobile-link"
          onClick={() => setMenuOpen(false)}
        >
          submit a meetup
        </Link>
        <a
          href="https://www.bitcoinisbetter.org/donate"
          className="bib-mobile-donate"
        >
          donate
        </a>
      </div>
    </nav>
  );
}

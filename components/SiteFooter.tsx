export default function SiteFooter() {
  return (
    <footer className="border-t border-line-subtle bg-bg-dark mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-white font-medium text-sm tracking-widest mb-2">
            BITCOIN IS BETTER
          </div>
          <p className="text-ink-muted text-sm max-w-md leading-relaxed">
            Helping people discover and understand bitcoin. This meetup directory is
            maintained as a community resource.
          </p>
        </div>
        <div className="flex gap-6 text-xs text-ink-muted">
          <a href="https://www.bitcoinisbetter.org" className="hover:text-bitcoin-orange">
            bitcoinisbetter.org
          </a>
          <a href="/submit" className="hover:text-bitcoin-orange">
            Submit a meetup
          </a>
        </div>
      </div>
    </footer>
  );
}

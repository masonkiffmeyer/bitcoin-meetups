import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="max-w-md mx-auto">
        <div className="empty">
          <div className="eyebrow is-orange mb-4">404</div>
          <div className="empty-mark">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M14 14 L18 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3>Meetup not found</h3>
          <p>This meetup isn&apos;t in our directory yet. Think it should be?</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/" className="btn btn-primary">
              Browse directory
            </Link>
            <Link href="/submit" className="btn">
              Submit a meetup
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

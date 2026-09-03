import Link from "next/link";
import type { Metadata } from "next";

// The directory is a static site with no server behind it, so submissions go
// through the Google Form that feeds the Meetups Database sheet. Responses land
// in the sheet, get an Approved of TRUE once reviewed, and appear on the site
// at the next publish.
const FORM_URL = "https://forms.gle/3rVyzcLXfumRRfnv5";

export const metadata: Metadata = {
  title: "Submit a bitcoin meetup | Bitcoin Is Better",
  description:
    "Add a bitcoin meetup to the directory, or send a correction to an existing listing.",
};

export default function SubmitPage() {
  return (
    <section className="section">
      <div className="max-w-2xl mx-auto">
        <div className="eyebrow mb-6">
          <Link href="/">← Back to directory</Link>
        </div>

        <h1 className="hero-title">Submit a bitcoin meetup</h1>
        <p className="hero-sub mb-12">
          Add a meetup to the directory, or tell us what needs fixing on one that is already
          listed. Every submission is reviewed by hand before it goes live, which usually takes a
          day or two. Bitcoin-only meetups, please.
        </p>

        <div className="cta-strip" style={{ marginTop: 0 }}>
          <div>
            <h3 className="cta-title">Add your meetup</h3>
            <p className="cta-sub">
              Name, city, cadence and one way to reach the organizer is all it takes.
            </p>
          </div>
          <a href={FORM_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Open the form
          </a>
        </div>

        <div className="info-card" style={{ marginTop: 40 }}>
          <div className="info-card-title">Correcting an existing listing?</div>
          <div className="info-card-sub">
            Use the same form and name the meetup you are correcting. Organizers claiming a
            listing can say so there too, and we will get in touch to confirm.
          </div>
          <a href={FORM_URL} target="_blank" rel="noopener noreferrer" className="info-card-link">
            Send a correction →
          </a>
        </div>

        <div className="tail eyebrow">
          <Link href="/">← Back to directory</Link>
        </div>
      </div>
    </section>
  );
}

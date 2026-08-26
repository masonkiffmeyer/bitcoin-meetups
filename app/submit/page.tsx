import Link from "next/link";

const FORM_URL = "https://forms.gle/3rVyzcLXfumRRfnv5";

export default function SubmitPage() {
  return (
    <section className="section">
      <div className="max-w-2xl mx-auto">
        <div className="eyebrow mb-6">
          <Link href="/">← Back to directory</Link>
        </div>

        <h1 className="hero-title">Submit a bitcoin meetup</h1>
        <p className="hero-sub mb-12">
          Add a meetup to the directory. We manually review submissions to keep quality high,
          which usually takes a day or two. Bitcoin-only meetups only, please.
        </p>

        <div className="flex flex-col gap-5">
          <p className="hero-sub">
            Submissions are handled through our Google Form. It takes a couple of minutes and
            asks for the meetup name, location, cadence, and at least one contact link.
          </p>

          <div>
            <a
              href={FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Open the submission form
            </a>
          </div>

          <hr className="divider" />

          <div>
            <div className="eyebrow mb-3">Updating an existing listing?</div>
            <p className="hero-sub">
              Use the same form and tell us what needs to change — there&apos;s a field for it.
              We&apos;ll verify with the current organizer if needed before updating.
            </p>
          </div>

          <hr className="divider" />

          <p className="hero-sub">
            We&apos;ll review what you send and have it live within a few days. If we have
            questions, we&apos;ll reach out to the email you provide on the form. Your email is
            only used to verify your submission — it is not published or added to any mailing
            list.
          </p>
        </div>
      </div>
    </section>
  );
}

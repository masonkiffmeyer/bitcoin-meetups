"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SubmitForm() {
  const searchParams = useSearchParams();
  const updateSlug = searchParams.get("update");
  const isUpdate = !!updateSlug;

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    cadence: "",
    venue: "",
    description: "",
    website: "",
    twitter: "",
    nostr: "",
    telegram: "",
    organizerName: "",
    organizerEmail: "",
    beginnerFriendly: true,
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, isUpdate, updateSlug }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Submission failed" }));
        throw new Error(err.error || "Submission failed");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "success") {
    return (
      <section className="section">
        <div className="max-w-md mx-auto">
          <div className="empty">
            <div className="empty-mark">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 10 L9 14 L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Submission received</h3>
            <p>
              Thanks for helping grow the directory. We&apos;ll review your submission and have it
              live within a few days. If we have questions, we&apos;ll reach out to the email you
              provided.
            </p>
            <Link href="/" className="btn btn-primary">
              Back to directory
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="max-w-2xl mx-auto">
        <div className="eyebrow mb-6">
          <Link href="/">← Back to directory</Link>
        </div>

        <h1 className="hero-title">
          {isUpdate ? "Update meetup listing" : "Submit a bitcoin meetup"}
        </h1>
        <p className="hero-sub mb-12">
          {isUpdate
            ? "Tell us what needs to change. We'll verify with the existing organizer if needed before updating."
            : "Add a meetup to the directory. We manually review submissions to keep quality high, which usually takes a day or two. Bitcoin-only meetups only, please."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="eyebrow block mb-2">Meetup name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Lynchburg Bitcoiners"
              className="field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="eyebrow block mb-2">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Lynchburg"
                className="field"
              />
            </div>
            <div>
              <label className="eyebrow block mb-2">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Virginia"
                className="field"
              />
            </div>
          </div>

          <div>
            <label className="eyebrow block mb-2">Meeting cadence *</label>
            <input
              type="text"
              required
              value={formData.cadence}
              onChange={(e) => setFormData({ ...formData, cadence: e.target.value })}
              placeholder="e.g. Monthly, first Wednesday at 7pm"
              className="field"
            />
          </div>

          <div>
            <label className="eyebrow block mb-2">Typical venue</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g. Local brewery, rotating coffee shops"
              className="field"
            />
          </div>

          <div>
            <label className="eyebrow block mb-2">Short description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Who is this meetup for? What's the vibe? Any notable speakers or focus areas?"
              className="field"
            />
          </div>

          <div>
            <label className="field-check">
              <input
                type="checkbox"
                checked={formData.beginnerFriendly}
                onChange={(e) =>
                  setFormData({ ...formData, beginnerFriendly: e.target.checked })
                }
              />
              This meetup welcomes beginners
            </label>
          </div>

          <hr className="divider" />

          <div className="flex flex-col gap-3">
            <div className="eyebrow">Contact links (at least one)</div>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="Website URL"
              className="field"
            />
            <input
              type="text"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              placeholder="X/Twitter handle (no @)"
              className="field"
            />
            <input
              type="text"
              value={formData.nostr}
              onChange={(e) => setFormData({ ...formData, nostr: e.target.value })}
              placeholder="Nostr npub"
              className="field"
            />
            <input
              type="url"
              value={formData.telegram}
              onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
              placeholder="Telegram group URL"
              className="field"
            />
          </div>

          <hr className="divider" />

          <div>
            <div className="eyebrow mb-3">Your contact *</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={formData.organizerName}
                onChange={(e) =>
                  setFormData({ ...formData, organizerName: e.target.value })
                }
                placeholder="Your name"
                className="field"
              />
              <input
                type="email"
                required
                value={formData.organizerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, organizerEmail: e.target.value })
                }
                placeholder="Your email"
                className="field"
              />
            </div>
            <p className="hero-sub mt-2">
              Only used to verify your submission. Not published or added to any mailing list.
            </p>
          </div>

          {status === "error" && (
            <div className="alert-error">
              {errorMsg || "Something went wrong. Try again in a moment."}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="btn btn-primary"
            >
              {status === "submitting" ? "Submitting..." : "Submit meetup"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function SubmitPage() {
  return (
    <Suspense
      fallback={
        <section className="section">
          <div className="max-w-2xl mx-auto eyebrow">Loading...</div>
        </section>
      }
    >
      <SubmitForm />
    </Suspense>
  );
}

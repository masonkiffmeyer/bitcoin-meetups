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
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-3xl text-white font-medium mb-3">Submission received</h1>
        <p className="text-ink-secondary text-base mb-6">
          Thanks for helping grow the directory. We&apos;ll review your submission and have it live
          within a few days. If we have questions, we&apos;ll reach out to the email you provided.
        </p>
        <Link
          href="/"
          className="inline-block bg-bitcoin-orange text-bg-dark px-5 py-2.5 rounded text-sm font-medium hover:bg-bitcoin-orangeLight transition-colors"
        >
          Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <nav className="text-xs text-ink-muted mb-6">
        <Link href="/" className="hover:text-bitcoin-orange">
          ← Back to directory
        </Link>
      </nav>

      <h1 className="text-3xl text-white font-medium tracking-tight mb-3">
        {isUpdate ? "Update meetup listing" : "Submit a bitcoin meetup"}
      </h1>
      <p className="text-ink-secondary text-sm mb-8 leading-relaxed">
        {isUpdate
          ? "Tell us what needs to change. We'll verify with the existing organizer if needed before updating."
          : "Add a meetup to the directory. We manually review submissions to keep quality high, which usually takes a day or two. Bitcoin-only meetups only, please."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs text-ink-muted tracking-widest mb-2">
            MEETUP NAME *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Lynchburg Bitcoiners"
            className="w-full bg-bg-card border border-line-soft rounded px-4 py-2.5 text-sm text-white placeholder-ink-dim focus:outline-none focus:border-bitcoin-orange"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-ink-muted tracking-widest mb-2">CITY *</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Lynchburg"
              className="w-full bg-bg-card border border-line-soft rounded px-4 py-2.5 text-sm text-white placeholder-ink-dim focus:outline-none focus:border-bitcoin-orange"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-muted tracking-widest mb-2">STATE *</label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g. Virginia"
              className="w-full bg-bg-card border border-line-soft rounded px-4 py-2.5 text-sm text-white placeholder-ink-dim focus:outline-none focus:border-bitcoin-orange"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-ink-muted tracking-widest mb-2">
            MEETING CADENCE *
          </label>
          <input
            type="text"
            required
            value={formData.cadence}
            onChange={(e) => setFormData({ ...formData, cadence: e.target.value })}
            placeholder="e.g. Monthly, first Wednesday at 7pm"
            className="w-full bg-bg-card border border-line-soft rounded px-4 py-2.5 text-sm text-white placeholder-ink-dim focus:outline-none focus:border-bitcoin-orange"
          />
        </div>

        <div>
          <label className="block text-xs text-ink-muted tracking-widest mb-2">
            TYPICAL VENUE
          </label>
          <input
            type="text"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            placeholder="e.g. Local brewery, rotating coffee shops"
            className="w-full bg-bg-card border border-line-soft rounded px-4 py-2.5 text-sm text-white placeholder-ink-dim focus:outline-none focus:border-bitcoin-orange"
          />
        </div>

        <div>
          <label className="block text-xs text-ink-muted tracking-widest mb-2">
            SHORT DESCRIPTION *
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Who is this meetup for? What's the vibe? Any notable speakers or focus areas?"
            className="w-full bg-bg-card border border-line-soft rounded px-4 py-2.5 text-sm text-white placeholder-ink-dim focus:outline-none focus:border-bitcoin-orange resize-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-ink-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={formData.beginnerFriendly}
              onChange={(e) => setFormData({ ...formData, beginnerFriendly: e.target.checked })}
              className="w-4 h-4 rounded accent-bitcoin-orange"
            />
            This meetup welcomes beginners
          </label>
        </div>

        <div className="pt-4 border-t border-line-subtle">
          <div className="text-xs text-ink-muted tracking-widest mb-3">
            CONTACT LINKS (at least one)
          </div>
          <div className="space-y-3">
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="Website URL"
              className="w-full bg-bg-card border border-line-soft rounded px-4 py-2.5 text-sm text-white placeholder-ink-dim focus:outline-none focus:border-bitcoin-orange"
            />
            <input
              type="text"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              placeholder="X/Twitter handle (no @)"
              className="w-full bg-bg-card border border-line-soft rounded px-4 py-2.5 text-sm text-white placeholder-ink-dim focus:outline-none focus:border-bitcoin-orange"
            />
            <input
              type="text"
              value={formData.nostr}
              onChange={(e) => setFormData({ ...formData, nostr: e.target.value })}
              placeholder="Nostr npub"
              className="w-full bg-bg-card border border-line-soft rounded px-4 py-2.5 text-sm text-white placeholder-ink-dim focus:outline-none focus:border-bitcoin-orange"
            />
            <input
              type="url"
              value={formData.telegram}
              onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
              placeholder="Telegram group URL"
              className="w-full bg-bg-card border border-line-soft rounded px-4 py-2.5 text-sm text-white placeholder-ink-dim focus:outline-none focus:border-bitcoin-orange"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-line-subtle">
          <div className="text-xs text-ink-muted tracking-widest mb-3">YOUR CONTACT *</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              value={formData.organizerName}
              onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
              placeholder="Your name"
              className="w-full bg-bg-card border border-line-soft rounded px-4 py-2.5 text-sm text-white placeholder-ink-dim focus:outline-none focus:border-bitcoin-orange"
            />
            <input
              type="email"
              required
              value={formData.organizerEmail}
              onChange={(e) => setFormData({ ...formData, organizerEmail: e.target.value })}
              placeholder="Your email"
              className="w-full bg-bg-card border border-line-soft rounded px-4 py-2.5 text-sm text-white placeholder-ink-dim focus:outline-none focus:border-bitcoin-orange"
            />
          </div>
          <p className="text-xs text-ink-muted mt-2">
            Only used to verify your submission. Not published or added to any mailing list.
          </p>
        </div>

        {status === "error" && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {errorMsg || "Something went wrong. Try again in a moment."}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="bg-bitcoin-orange text-bg-dark px-6 py-3 rounded text-sm font-medium hover:bg-bitcoin-orangeLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "Submitting..." : "Submit meetup"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-6 py-8 text-ink-muted">Loading...</div>}>
      <SubmitForm />
    </Suspense>
  );
}

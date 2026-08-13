import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

// Self-hosted through next/font so mobile visitors don't pay for a
// render-blocking @import plus two extra TLS handshakes to Google before any
// text can paint.
const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bitcoin Meetups | Bitcoin Is Better",
  description:
    "Find a bitcoin meetup near you. The most comprehensive directory of in-person bitcoin meetups across the United States, maintained by Bitcoin Is Better.",
  keywords: [
    "bitcoin meetup",
    "bitcoin meetups near me",
    "bitcoin community",
    "local bitcoin group",
    "bitcoin only meetup",
  ],
  openGraph: {
    title: "Bitcoin Meetups Directory",
    description: "Find a bitcoin meetup near you.",
    type: "website",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom stays available — capping it would fail WCAG 1.4.4.
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <body>
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

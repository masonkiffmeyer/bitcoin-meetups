import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

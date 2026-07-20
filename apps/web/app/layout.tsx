import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://canvium.gallery"),
  title: {
    default: "Canvium Gallery",
    template: "%s · Canvium Gallery",
  },
  description:
    "An online gallery for close looking, trusted museum records, and evidence-aware artist conversations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

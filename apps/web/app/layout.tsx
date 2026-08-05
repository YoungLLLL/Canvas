import type { Metadata } from "next";
import {
  Belleza,
  Cormorant_Garamond,
  Federo,
  Inter,
  Noto_Sans_SC,
  Odor_Mean_Chey,
} from "next/font/google";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const latinBodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body-latin",
  display: "swap",
});

const chineseBodyFont = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body-zh",
  display: "swap",
});

const coverCanviumFont = Belleza({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cover-canvium",
  display: "swap",
});

const coverGalleryFont = Federo({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cover-gallery",
  display: "swap",
});

const logoFont = Odor_Mean_Chey({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-logo",
  display: "swap",
});

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
    <html
      className={`${displayFont.variable} ${latinBodyFont.variable} ${chineseBodyFont.variable} ${coverCanviumFont.variable} ${coverGalleryFont.variable} ${logoFont.variable}`}
      lang="en"
    >
      <head>
        <link
          as="font"
          crossOrigin="anonymous"
          href="/fonts/otomanopee-one-v11.ttf"
          rel="preload"
          type="font/ttf"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

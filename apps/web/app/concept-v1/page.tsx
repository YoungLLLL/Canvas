import type { Metadata } from "next";

import { ConceptV1 } from "@/src/components/concept-v1";

export const metadata: Metadata = {
  title: "Canvium Concept v1",
  description: "A standalone concept for the simplified four-page Canvium experience.",
  robots: { index: false, follow: false },
};

export default function ConceptV1Page() {
  return <ConceptV1 />;
}

import { describe, expect, it } from "vitest";

import { commonsFileTitle, isPublicDomainImage } from "@/src/lib/wikimedia";

describe("Wikimedia Commons adapter", () => {
  it("converts Wikidata Special:FilePath values into Commons file titles", () => {
    expect(
      commonsFileTitle(
        "http://commons.wikimedia.org/wiki/Special:FilePath/Nighthawks%20by%20Edward%20Hopper%201942.jpg",
      ),
    ).toBe("File:Nighthawks by Edward Hopper 1942.jpg");
  });

  it("only admits image metadata explicitly marked public domain", () => {
    const base = {
      width: 1000,
      height: 800,
      thumburl: "https://upload.wikimedia.org/example.jpg",
      thumbwidth: 843,
      thumbheight: 674,
      url: "https://upload.wikimedia.org/original.jpg",
      descriptionurl: "https://commons.wikimedia.org/wiki/File:Example.jpg",
      mime: "image/jpeg",
    };
    expect(
      isPublicDomainImage({
        ...base,
        extmetadata: {
          Copyrighted: { value: "False" },
          LicenseShortName: { value: "Public domain" },
        },
      }),
    ).toBe(true);
    expect(
      isPublicDomainImage({
        ...base,
        extmetadata: {
          Copyrighted: { value: "True" },
          LicenseShortName: { value: "CC BY-SA 4.0" },
        },
      }),
    ).toBe(false);
  });
});

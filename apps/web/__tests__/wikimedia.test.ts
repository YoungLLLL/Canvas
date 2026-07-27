import { describe, expect, it } from "vitest";

import {
  commonsFileTitle,
  isAcceptedCommonsImage,
  resolveCommonsImageRights,
} from "@/src/lib/wikimedia";

describe("Wikimedia Commons adapter", () => {
  it("converts Wikidata Special:FilePath values into Commons file titles", () => {
    expect(
      commonsFileTitle(
        "http://commons.wikimedia.org/wiki/Special:FilePath/Nighthawks%20by%20Edward%20Hopper%201942.jpg",
      ),
    ).toBe("File:Nighthawks by Edward Hopper 1942.jpg");
  });

  it("admits explicit open and non-commercial CC licenses while rejecting unclear rights", () => {
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
      isAcceptedCommonsImage({
        ...base,
        extmetadata: {
          Copyrighted: { value: "False" },
          LicenseShortName: { value: "Public domain" },
        },
      }),
    ).toBe(true);
    expect(
      isAcceptedCommonsImage({
        ...base,
        extmetadata: {
          Copyrighted: { value: "True" },
          LicenseShortName: { value: "CC BY-SA 4.0" },
          LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/4.0/" },
        },
      }),
    ).toBe(true);
    expect(
      resolveCommonsImageRights({
        ...base,
        extmetadata: {
          Copyrighted: { value: "True" },
          LicenseShortName: { value: "CC BY-NC-ND 4.0" },
          LicenseUrl: { value: "https://creativecommons.org/licenses/by-nc-nd/4.0/" },
        },
      }),
    ).toMatchObject({
      licenseCode: "CC-BY-NC-ND-4.0",
      usage: {
        commercialUseAllowed: false,
        adaptationsAllowed: false,
        attributionRequired: true,
      },
    });
    expect(
      isAcceptedCommonsImage({
        ...base,
        extmetadata: {
          Copyrighted: { value: "True" },
          LicenseShortName: { value: "All rights reserved" },
        },
      }),
    ).toBe(false);
  });
});

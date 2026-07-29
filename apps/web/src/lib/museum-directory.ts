export type MuseumDirectoryEntry = {
  id: string;
  name: { en: string; zh: string };
  city: { en: string; zh: string };
  country: { en: string; zh: string };
  description: { en: string; zh: string };
  lat: number;
  lng: number;
  websiteUrl: string;
  collection:
    | { source: "artic"; museumSlug: "art-institute-of-chicago" }
    | { source: "europeana"; dataProvider: string };
};

export const museumDirectory = [
  {
    id: "artic",
    name: { en: "Art Institute of Chicago", zh: "芝加哥艺术博物馆" },
    city: { en: "Chicago", zh: "芝加哥" },
    country: { en: "United States", zh: "美国" },
    description: {
      en: "A major encyclopedic museum known for Impressionist, Post-Impressionist, and American art.",
      zh: "一座百科全书式艺术博物馆，以印象派、后印象派与美国艺术收藏闻名。",
    },
    lat: 41.8796,
    lng: -87.6237,
    websiteUrl: "https://www.artic.edu",
    collection: { source: "artic", museumSlug: "art-institute-of-chicago" },
  },
  {
    id: "rijksmuseum",
    name: { en: "Rijksmuseum", zh: "荷兰国立博物馆" },
    city: { en: "Amsterdam", zh: "阿姆斯特丹" },
    country: { en: "Netherlands", zh: "荷兰" },
    description: {
      en: "The national museum of the Netherlands, presenting Dutch art and history from the Middle Ages onward.",
      zh: "荷兰国家博物馆，系统呈现自中世纪以来的荷兰艺术与历史，馆藏包括伦勃朗与维米尔名作。",
    },
    lat: 52.36,
    lng: 4.8852,
    websiteUrl: "https://www.rijksmuseum.nl",
    collection: { source: "europeana", dataProvider: "Rijksmuseum" },
  },
  {
    id: "albertina",
    name: { en: "The Albertina Museum", zh: "阿尔贝蒂娜博物馆" },
    city: { en: "Vienna", zh: "维也纳" },
    country: { en: "Austria", zh: "奥地利" },
    description: {
      en: "A Vienna museum celebrated for its graphic arts collection and works spanning Monet to Picasso.",
      zh: "位于维也纳市中心，以版画与素描收藏著称，并收藏从莫奈到毕加索的重要现代艺术作品。",
    },
    lat: 48.2044,
    lng: 16.3687,
    websiteUrl: "https://www.albertina.at/en/",
    collection: { source: "europeana", dataProvider: "The Albertina Museum" },
  },
  {
    id: "belvedere",
    name: { en: "Austrian Gallery Belvedere", zh: "奥地利美景宫美术馆" },
    city: { en: "Vienna", zh: "维也纳" },
    country: { en: "Austria", zh: "奥地利" },
    description: {
      en: "An art museum in Vienna's historic Belvedere palaces, noted for Austrian art and works by Gustav Klimt.",
      zh: "坐落于维也纳历史悠久的美景宫建筑群，以奥地利艺术及古斯塔夫·克里姆特作品闻名。",
    },
    lat: 48.1915,
    lng: 16.3808,
    websiteUrl: "https://www.belvedere.at/en",
    collection: { source: "europeana", dataProvider: "Austrian Gallery Belvedere" },
  },
] as const satisfies readonly MuseumDirectoryEntry[];

export function museumById(id?: string) {
  return museumDirectory.find((museum) => museum.id === id);
}

export function museumCollectionHref(id: string, locale: "en" | "zh") {
  const museum = museumById(id);
  if (!museum) return null;
  if (museum.collection.source === "artic") {
    return `/${locale}/museums/${museum.collection.museumSlug}/collection`;
  }
  return `/${locale}/museums/europeana/collection?museum=${encodeURIComponent(museum.id)}`;
}

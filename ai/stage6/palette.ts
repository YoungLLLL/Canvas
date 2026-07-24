import type { ArtworkKnowledgePackage } from "../../apps/web/src/schemas/ai-content.ts";

type PaletteColor = ArtworkKnowledgePackage["content"]["palette"][number];

export type PixelImage = {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
};

type Bucket = {
  count: number;
  red: number;
  green: number;
  blue: number;
};

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue]
    .map((value) => clampByte(value).toString(16).padStart(2, "0"))
    .join("")}`;
}

function luminance(red: number, green: number, blue: number): number {
  const linear = [red, green, blue].map((value) => {
    const channel = value / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return Number(
    (0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]).toFixed(4),
  );
}

function colorDistance(
  left: [number, number, number],
  right: [number, number, number],
): number {
  const redMean = (left[0] + right[0]) / 2;
  const red = left[0] - right[0];
  const green = left[1] - right[1];
  const blue = left[2] - right[2];
  return Math.sqrt(
    (2 + redMean / 256) * red * red +
      4 * green * green +
      (2 + (255 - redMean) / 256) * blue * blue,
  );
}

function labelColor(
  red: number,
  green: number,
  blue: number,
  locale: string,
): string {
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const lightness = (maximum + minimum) / 510;
  const chroma = maximum - minimum;
  const zh = locale.toLowerCase().startsWith("zh");
  if (lightness < 0.13) return zh ? "近黑" : "near black";
  if (lightness > 0.88 && chroma < 24) return zh ? "近白" : "near white";
  if (chroma < 18)
    return zh
      ? lightness < 0.5
        ? "深灰"
        : "浅灰"
      : lightness < 0.5
        ? "dark gray"
        : "light gray";

  let hue = 0;
  if (maximum === red)
    hue = ((green - blue) / chroma + (green < blue ? 6 : 0)) * 60;
  else if (maximum === green) hue = ((blue - red) / chroma + 2) * 60;
  else hue = ((red - green) / chroma + 4) * 60;

  const names = zh
    ? ["红", "橙", "黄", "绿", "青", "蓝", "紫", "洋红"]
    : ["red", "orange", "yellow", "green", "cyan", "blue", "violet", "magenta"];
  const index = Math.round(hue / 45) % 8;
  const prefix = zh
    ? lightness < 0.32
      ? "深"
      : lightness > 0.72
        ? "浅"
        : ""
    : lightness < 0.32
      ? "dark "
      : lightness > 0.72
        ? "light "
        : "";
  return `${prefix}${names[index]}`;
}

export function extractDeterministicPalette(
  image: PixelImage,
  options: { colors?: number; locale?: string; maxSamples?: number } = {},
): PaletteColor[] {
  const expectedLength = image.width * image.height * 4;
  if (
    !Number.isInteger(image.width) ||
    !Number.isInteger(image.height) ||
    image.width <= 0 ||
    image.height <= 0 ||
    image.data.length !== expectedLength
  ) {
    throw new Error("RGBA image dimensions do not match pixel data");
  }

  const targetColors = Math.max(1, Math.min(12, options.colors ?? 6));
  const maxSamples = Math.max(1, options.maxSamples ?? 12_000);
  const pixelCount = image.width * image.height;
  const stride = Math.max(1, Math.ceil(pixelCount / maxSamples));
  const buckets = new Map<number, Bucket>();
  const samples: [number, number, number][] = [];

  for (let pixel = 0; pixel < pixelCount; pixel += stride) {
    const offset = pixel * 4;
    if (image.data[offset + 3] < 128) continue;
    const red = image.data[offset];
    const green = image.data[offset + 1];
    const blue = image.data[offset + 2];
    samples.push([red, green, blue]);
    const key = (red >> 3) * 1024 + (green >> 3) * 32 + (blue >> 3);
    const bucket = buckets.get(key) ?? { count: 0, red: 0, green: 0, blue: 0 };
    bucket.count += 1;
    bucket.red += red;
    bucket.green += green;
    bucket.blue += blue;
    buckets.set(key, bucket);
  }
  if (samples.length === 0) return [];

  const ranked = [...buckets.entries()]
    .sort((left, right) => right[1].count - left[1].count || left[0] - right[0])
    .map(
      ([, bucket]) =>
        [
          bucket.red / bucket.count,
          bucket.green / bucket.count,
          bucket.blue / bucket.count,
        ] as [number, number, number],
    );

  const centers: [number, number, number][] = [];
  for (const color of ranked) {
    if (centers.every((center) => colorDistance(center, color) >= 28))
      centers.push(color);
    if (centers.length === targetColors) break;
  }
  if (centers.length === 0) centers.push(ranked[0]);

  const groups = centers.map(() => ({ count: 0, red: 0, green: 0, blue: 0 }));
  for (const sample of samples) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    centers.forEach((center, index) => {
      const distance = colorDistance(sample, center);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    const group = groups[bestIndex];
    group.count += 1;
    group.red += sample[0];
    group.green += sample[1];
    group.blue += sample[2];
  }

  return groups
    .filter((group) => group.count > 0)
    .sort((left, right) => right.count - left.count)
    .map((group) => {
      const red = group.red / group.count;
      const green = group.green / group.count;
      const blue = group.blue / group.count;
      return {
        hex: hex(red, green, blue),
        proportion: Number((group.count / samples.length).toFixed(6)),
        luminance: luminance(red, green, blue),
        label: labelColor(red, green, blue, options.locale ?? "en"),
      };
    });
}

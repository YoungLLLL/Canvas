import sharp from "/Users/youngllll/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/lib/index.js";

const root = "/Users/youngllll/Documents/Codex/canvas/首页视觉/视差分层";
const png = `${root}/png`;
const basePath = `${png}/00-background.png`;
const baseMetadata = await sharp(basePath).metadata();
const scale = (baseMetadata.width ?? 1672) / 1672;
const scaled = (value) => Math.round(value * scale);

async function fitted(name, width, height) {
  let image = sharp(`${png}/${name}`).trim();
  image = height
    ? image.resize({ width: scaled(width), height: scaled(height), fit: "fill" })
    : image.resize({ width: scaled(width), fit: "inside", withoutEnlargement: false });
  return image.png().toBuffer();
}

async function croppedFurniture(left, top, width, height, outWidth, outHeight) {
  const crop = await sharp(`${png}/09-furniture.png`)
    .extract({ left, top, width, height })
    .png()
    .toBuffer();
  return sharp(crop)
    .trim()
    .resize({ width: scaled(outWidth), height: scaled(outHeight), fit: "fill" })
    .png()
    .toBuffer();
}

const layers = [
  // Chairs sit behind all figures.
  { input: await croppedFurniture(0, 350, 470, 590, 360, 500), left: scaled(35), top: scaled(441) },
  { input: await croppedFurniture(1200, 350, 470, 590, 360, 500), left: scaled(1277), top: scaled(441) },

  // Rear row.
  { input: await fitted("01-back-left.png", 350), left: scaled(525), top: scaled(175) },
  { input: await fitted("02-back-right.png", 400), left: scaled(880), top: scaled(180) },

  // Front row.
  { input: await fitted("05-center.png", 350), left: scaled(690), top: scaled(360) },
  { input: await fitted("04-left-center-white-beard.png", 360), left: scaled(450), top: scaled(370) },
  { input: await fitted("06-right-center.png", 390), left: scaled(975), top: scaled(365) },
  { input: await fitted("03-left-vangogh.png", 560), left: scaled(145), top: scaled(350) },
  { input: await fitted("07-right-frida.png", 410), left: scaled(1160), top: scaled(330) },

  // Table covers the lower bodies, matching the original foreground depth.
  { input: await croppedFurniture(330, 485, 1010, 456, 940, 325), left: scaled(365), top: scaled(616) },

  // Laptop is the visual anchor and remains nearly stationary in parallax.
  { input: await fitted("08-laptop.png", 310), left: scaled(680), top: scaled(520) },
];

await sharp(basePath)
  .composite(layers)
  .png()
  .toFile(`${root}/preview.png`);

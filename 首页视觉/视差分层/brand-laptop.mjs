import sharp from "/Users/youngllll/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/lib/index.js";
import { createCanvas, GlobalFonts } from "/Users/youngllll/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas/index.js";

const root = "/Users/youngllll/Documents/Codex/canvas/首页视觉/视差分层";
const basePath = `${root}/png/08-laptop-canvium-base.png`;
const outputPath = `${root}/png/08-laptop.png`;
const fontFile = "/Users/youngllll/Documents/Codex/canvas/Canvas/apps/web/public/fonts/otomanopee-one-v11.ttf";

GlobalFonts.registerFromPath(fontFile, "Otomanopee One");

const logoCanvas = createCanvas(520, 190);
const context = logoCanvas.getContext("2d");
context.clearRect(0, 0, logoCanvas.width, logoCanvas.height);
context.textAlign = "center";
context.textBaseline = "middle";
context.font = '76px "Otomanopee One"';

// A restrained cool glow that matches the laptop's existing blue reflection.
context.shadowColor = "rgba(83, 201, 255, 0.95)";
context.shadowBlur = 30;
context.fillStyle = "rgba(205, 242, 255, 0.70)";
context.fillText("Canvium", logoCanvas.width / 2, logoCanvas.height / 2 + 2);
context.shadowBlur = 13;
context.fillStyle = "#f5fcff";
context.fillText("Canvium", logoCanvas.width / 2, logoCanvas.height / 2 + 2);

const logo = logoCanvas.toBuffer("image/png");
const left = 836 - Math.round(logoCanvas.width / 2);
const top = 469 - Math.round(logoCanvas.height / 2);

await sharp(basePath)
  .composite([{ input: logo, left, top, blend: "screen" }])
  .png()
  .toFile(outputPath);

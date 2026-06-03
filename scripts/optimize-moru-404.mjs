import { execFileSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** Visible height ratio after cropping bottom watermark (0.88 = remove bottom 12%) */
const CROP_RATIO = 0.88;

const downloadsSource = path.join(
  process.env.HOME ?? "",
  "Downloads",
  "moru_404.mp4"
);
const assetsSource = path.join(root, "assets-source/moru/moru_404.mp4");
const outDir = path.join(root, "public/images/moru");
const animatedWebp = path.join(outDir, "404.webp");
const posterWebp = path.join(outDir, "404-poster.webp");
const posterFrame = path.join(outDir, "_404-poster-frame.png");
const tempGif = path.join(outDir, "_404-temp.gif");

function ensureFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function runFfmpeg(args) {
  execFileSync("ffmpeg", ["-y", ...args], { stdio: "inherit" });
}

async function main() {
  if (!ensureFfmpeg()) {
    console.error(
      "ffmpeg is required. Install with: brew install ffmpeg\nThen run: pnpm moru:404"
    );
    process.exit(1);
  }

  try {
    await fs.access(downloadsSource);
  } catch {
    console.error(`Source not found: ${downloadsSource}`);
    process.exit(1);
  }

  await fs.mkdir(path.dirname(assetsSource), { recursive: true });
  await fs.mkdir(outDir, { recursive: true });
  await fs.copyFile(downloadsSource, assetsSource);

  const cropFilter = `crop=iw:ih*${CROP_RATIO}:0:0`;

  console.log(`Cropping with: ${cropFilter}`);

  // Homebrew ffmpeg often lacks libwebp; crop → GIF → sharp animated WebP
  const gifFilter = `${cropFilter},fps=24,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
  runFfmpeg([
    "-i",
    assetsSource,
    "-vf",
    gifFilter,
    "-an",
    "-loop",
    "0",
    tempGif,
  ]);

  await sharp(tempGif, { animated: true })
    .webp({ quality: 82, effort: 4 })
    .toFile(animatedWebp);

  await fs.unlink(tempGif).catch(() => {});

  runFfmpeg([
    "-i",
    assetsSource,
    "-vf",
    cropFilter,
    "-frames:v",
    "1",
    posterFrame,
  ]);

  await sharp(posterFrame)
    .webp({ quality: 85 })
    .toFile(posterWebp);

  await fs.unlink(posterFrame).catch(() => {});

  const stats = await fs.stat(animatedWebp);
  console.log(`Wrote ${animatedWebp} (${(stats.size / 1024).toFixed(0)} KB)`);
  console.log(`Wrote ${posterWebp}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

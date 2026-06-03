import { execFileSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** Visible height ratio after cropping bottom watermark (0.88 = remove bottom 12%) */
const CROP_RATIO = 0.88;
const SCALE_WIDTH = 960;
const FPS = 15;
const CRF = 27;

const downloadsSource = path.join(
  process.env.HOME ?? "",
  "Downloads",
  "moru_404.mp4"
);
const assetsSource = path.join(root, "assets-source/moru/moru_404.mp4");
const outDir = path.join(root, "public/images/moru");
const videoMp4 = path.join(outDir, "404.mp4");
const legacyWebp = path.join(outDir, "404.webp");
const posterWebp = path.join(outDir, "404-poster.webp");
const posterFrame = path.join(outDir, "_404-poster-frame.png");

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

  const videoFilter = `crop=iw:ih*${CROP_RATIO}:0:0,scale=${SCALE_WIDTH}:-2,fps=${FPS}`;

  console.log(`Video filter: ${videoFilter}`);

  runFfmpeg([
    "-i",
    assetsSource,
    "-vf",
    videoFilter,
    "-an",
    "-c:v",
    "libx264",
    "-crf",
    String(CRF),
    "-preset",
    "slow",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    videoMp4,
  ]);

  runFfmpeg([
    "-i",
    assetsSource,
    "-vf",
    `crop=iw:ih*${CROP_RATIO}:0:0,scale=${SCALE_WIDTH}:-2`,
    "-frames:v",
    "1",
    posterFrame,
  ]);

  await sharp(posterFrame)
    .webp({ quality: 85 })
    .toFile(posterWebp);

  await fs.unlink(posterFrame).catch(() => {});
  await fs.unlink(legacyWebp).catch(() => {});

  const stats = await fs.stat(videoMp4);
  console.log(`Wrote ${videoMp4} (${(stats.size / 1024).toFixed(0)} KB)`);
  console.log(`Wrote ${posterWebp}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

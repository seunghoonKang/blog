import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const downloadsSource = path.join(
  process.env.HOME ?? "",
  "Downloads",
  "moru_hero_original.jpeg"
);
const assetsSource = path.join(root, "assets-source/moru/moru_hero_original.jpeg");
const outDir = path.join(root, "public/images/moru");
const widths = [400, 768, 1280];

async function main() {
  try {
    await fs.access(downloadsSource);
  } catch {
    console.error(`Source not found: ${downloadsSource}`);
    process.exit(1);
  }

  await fs.mkdir(path.dirname(assetsSource), { recursive: true });
  await fs.mkdir(outDir, { recursive: true });
  await fs.copyFile(downloadsSource, assetsSource);

  const input = sharp(assetsSource);
  const meta = await input.metadata();
  console.log(`Source: ${meta.width}x${meta.height}`);

  for (const width of widths) {
    const outPath = path.join(outDir, `hero-${width}.webp`);
    await input
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);
    console.log(`Wrote ${outPath}`);
  }

  const heroPath = path.join(outDir, "hero.webp");
  await input
    .clone()
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(heroPath);
  console.log(`Wrote ${heroPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

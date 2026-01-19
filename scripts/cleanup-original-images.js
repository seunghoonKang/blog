import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const notesImagesDir = path.join(__dirname, "..", "public", "notes-images");

// 삭제할 이미지 확장자 목록
const imageExtensionsToDelete = [".jpg", ".jpeg", ".png", ".gif"];

async function cleanupOriginalImages() {
  try {
    // notes-images 디렉토리 확인
    try {
      await fs.access(notesImagesDir);
    } catch {
      console.log("notes-images 디렉토리가 존재하지 않습니다.");
      return;
    }

    // 모든 하위 디렉토리 읽기
    const noteDirs = await fs.readdir(notesImagesDir, { withFileTypes: true });
    const directories = noteDirs.filter((dirent) => dirent.isDirectory());

    if (directories.length === 0) {
      console.log("삭제할 이미지가 없습니다.");
      return;
    }

    let totalDeleted = 0;
    let totalSkipped = 0;

    for (const dir of directories) {
      const noteDirPath = path.join(notesImagesDir, dir.name);
      const files = await fs.readdir(noteDirPath);

      for (const file of files) {
        const filePath = path.join(noteDirPath, file);
        const ext = path.extname(file).toLowerCase();

        // WebP 파일이 아니고, 삭제 대상 확장자인 경우 삭제
        if (ext !== ".webp" && ext !== ".svg" && imageExtensionsToDelete.includes(ext)) {
          try {
            await fs.unlink(filePath);
            console.log(`✓ 삭제: ${dir.name}/${file}`);
            totalDeleted++;
          } catch (error) {
            console.error(`✗ 삭제 실패: ${dir.name}/${file}`, error.message);
            totalSkipped++;
          }
        }
      }
    }

    console.log("\n=== 정리 완료 ===");
    console.log(`삭제된 파일: ${totalDeleted}개`);
    if (totalSkipped > 0) {
      console.log(`삭제 실패: ${totalSkipped}개`);
    }
  } catch (error) {
    console.error("오류 발생:", error);
    process.exit(1);
  }
}

cleanupOriginalImages();


import path from "path";
import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";

// On Vercel, filesystem is read-only except /tmp
// We copy data files to /tmp on first access so writes work
const isVercel = process.env.VERCEL === "1";
const tmpDir = "/tmp/jeffrey-hq-data";

export async function getDataPath(filename: string): Promise<string> {
  if (!isVercel) {
    return path.join(process.cwd(), "data", filename);
  }

  // Vercel: use /tmp, copy seed file if not exists
  await mkdir(tmpDir, { recursive: true });
  const tmpPath = path.join(tmpDir, filename);

  if (!existsSync(tmpPath)) {
    const seedPath = path.join(process.cwd(), "data", filename);
    if (existsSync(seedPath)) {
      await copyFile(seedPath, tmpPath);
    }
  }

  return tmpPath;
}

import fs from "fs";
import path from "path";

export async function writeFiles(basePath, files) {
  for (const filePath in files) {
    const fullPath = path.join(basePath, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, files[filePath]);
  }
}

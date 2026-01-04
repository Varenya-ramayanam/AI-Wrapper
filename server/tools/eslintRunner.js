import { exec } from "child_process";

export function runESLint(scanPath) {
  return new Promise((resolve) => {
    exec(
      `npx eslint ${scanPath} --format json`,
      (error, stdout) => {
        if (stdout) {
          resolve(JSON.parse(stdout));
        } else {
          resolve([]);
        }
      }
    );
  });
}

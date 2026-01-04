import { exec } from "child_process";

export function runSemgrep(scanPath) {
  return new Promise((resolve) => {
    exec(
      `semgrep --config=p/secrets --json ${scanPath}`,
      (error, stdout) => {
        if (stdout) {
          resolve(JSON.parse(stdout).results || []);
        } else {
          resolve([]);
        }
      }
    );
  });
}

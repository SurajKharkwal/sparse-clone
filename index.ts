import { rm, rename as fsRename, readdir } from "fs/promises";
import path from "path";
import { spawn } from "node:child_process";
import https from "https";

async function githubPageExists(url: string): Promise<boolean> {
  try {
    const match = url.match(/github\.com[/:]([^/]+)\/([^/]+)(?:\/|$)/);
    if (!match) return false;

    const [_, owner, repoRaw] = match;
    const repo = repoRaw?.replace(/\.git$/, "");

    const options = {
      hostname: "api.github.com",
      path: `/repos/${owner}/${repo}`,
      method: "GET",
      headers: { "User-Agent": "space-clone" },
    };

    return await new Promise<boolean>((resolve) => {
      const req = https.request(options, (res) => {
        resolve(res.statusCode === 200);
      });

      req.on("error", () => resolve(false));
      req.end();
    });
  } catch {
    return false;
  }
}

function runCommand(command: string, args: string[], cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: "inherit", cwd });
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`))));
    proc.on("error", reject);
  });
}

async function moveFolderContent(srcDir: string, destDir: string) {
  const files = await readdir(srcDir);
  await Promise.all(
    files.map((file) => fsRename(path.join(srcDir, file), path.join(destDir, file)))
  );
  await rm(srcDir, { recursive: true, force: true });
}

export async function sparceClone(
  url: string,
  subDir: string,
  target: string,
  delGit: boolean = true,
  mvToRoot: boolean = true
) {
  if (!(await githubPageExists(url))) {
    throw new Error("Page not found (404)");
  }

  await runCommand("git", ["clone", "--no-checkout", url, target]);
  await runCommand("git", ["sparse-checkout", "init", "--no-cone"], target);
  await runCommand("git", ["sparse-checkout", "set", subDir], target);
  await runCommand("git", ["checkout"], target);

  if (mvToRoot) {
    await moveFolderContent(path.join(target, subDir), target);
  }

  if (delGit) {
    await rm(path.join(target, ".git"), { recursive: true, force: true });
  }
}


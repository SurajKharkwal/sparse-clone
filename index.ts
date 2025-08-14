import { rm, rename as fsRename, readdir, stat } from "fs/promises";
import path from "path";
import { spawn } from "node:child_process";
import https from "https";

async function githubPageExists(url: string): Promise<boolean> {
  const match = url.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/);
  if (!match) return false;

  const [, owner, repo] = match;
  const options = {
    hostname: "api.github.com",
    path: `/repos/${owner}/${repo}`,
    method: "GET",
    headers: { "User-Agent": "space-clone" },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => resolve(res.statusCode === 200));
    req.on("error", () => resolve(false));
    req.end();
  });
}

function runCommand(command: string, args: string[], silent: boolean, cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: silent ? "pipe" : "inherit", cwd });
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`))));
    proc.on("error", reject);
  });
}

async function moveFolderContent(srcDir: string, destDir: string) {
  const files = await readdir(srcDir);
  await Promise.all(files.map((file) => fsRename(path.join(srcDir, file), path.join(destDir, file))));
  await rm(srcDir, { recursive: true, force: true });

  // Remove empty parent folders up to destDir
  let currentDir = path.dirname(srcDir);
  while (currentDir !== destDir) {
    try {
      const remaining = await readdir(currentDir);
      if (remaining.length === 0) {
        await rm(currentDir, { recursive: true, force: true });
        currentDir = path.dirname(currentDir);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
}

async function checkIfDirectoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await stat(dirPath);
    return stats.isDirectory();
  } catch (error: any) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

export async function sparseClone(
  url: string,
  subDir: string,
  target: string,
  opts: {
    silent?: boolean
    delGit?: boolean;
    mvToRoot?: boolean;
    overrideDir?: boolean;
  } = {}
) {
  const { silent = true, delGit = true, mvToRoot = true, overrideDir = false } = opts;

  if (!(await githubPageExists(url))) {
    throw new Error("Page not found (404)");
  }

  if (await checkIfDirectoryExists(target)) {
    if (overrideDir) {
      await rm(target, { recursive: true, force: true });
    } else {
      throw new Error(`Target directory "${target}" already exists.`);
    }
  }

  await runCommand("git", ["clone", "--filter=blob:none", "--no-checkout", url, target], silent);
  await runCommand("git", ["sparse-checkout", "init", "--no-cone"], silent, target);
  await runCommand("git", ["sparse-checkout", "set", subDir], silent, target);
  await runCommand("git", ["checkout"], silent, target);

  if (mvToRoot) {
    await moveFolderContent(path.join(target, subDir), target);
  }

  if (delGit) {
    await rm(path.join(target, ".git"), { recursive: true, force: true });
  }
}


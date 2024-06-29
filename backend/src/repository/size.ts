import { exec } from "child_process";
import filesizeParser from "filesize-parser";
import { SimpleGit, simpleGit } from "simple-git";
import type { LFS } from "./types";

export async function getRepoSizes(
  repoPath: string
): Promise<{ size: number; lfs: LFS[] }> {
  const countObjectsSize = await getCountObjectsSizeInBytes(repoPath);
  const lfsFilesSizes = await getLfsFilesSizes(repoPath);
  const totalLfsFilesSize = lfsFilesSizes.reduce(
    (acc, curr) => acc + curr.size,
    0
  );

  return { size: totalLfsFilesSize + countObjectsSize, lfs: lfsFilesSizes };
}

export async function getCountObjectsSizeInBytes(
  repoPath: string
): Promise<number> {
  const git: SimpleGit = simpleGit().cwd({ path: repoPath });
  const count = await git.countObjects();

  return (count.size + count.sizePack) * 1024;
}

export async function getLfsFilesSizes(repoPath: string): Promise<LFS[]> {
  return new Promise((resolve, reject) => {
    exec("git lfs ls-files -s", { cwd: repoPath }, (error, stdout) => {
      if (error) {
        return reject(error);
      }

      const lfsFiles = stdout
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const filePath = getFilePathFromLfsStdout(line);
          const rawSize = getFileSizeFromLfsStdout(line);

          return {
            size: rawSize ? filesizeParser(rawSize) : 0,
            filePath: filePath || "",
          };
        });

      resolve(lfsFiles);
    });
  });
}

export function getFileSizeFromLfsStdout(stdoutLine: string): string | null {
  const startIndex = stdoutLine.lastIndexOf("(") + 1;
  if (startIndex === -1) {
    return null;
  }
  const endIndex = stdoutLine.lastIndexOf(")");
  if (endIndex === -1 || startIndex > endIndex) {
    return null;
  }

  return stdoutLine.substring(startIndex, endIndex);
}

export function getFilePathFromLfsStdout(stdoutLine: string): string | null {
  const regex = / - ([^()]+) \(/;
  const match = stdoutLine.match(regex);

  if (match) {
    return match[1];
  }

  return null;
}

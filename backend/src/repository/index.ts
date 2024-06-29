import fs from "fs";
import path from "path";
import { SimpleGit, simpleGit } from "simple-git";
import { getRepoReadme } from "./readme";
import { getRepoSizes } from "./size";
import type { RepoData } from "./types";

export async function cloneRepoAndGetData(modelId: string): Promise<RepoData> {
  const git: SimpleGit = simpleGit();
  await git.clone(`git@hf.co:${modelId}`, getRepoDirPath(modelId));

  return getRepoData(modelId);
}

export async function getRepoData(modelId: string): Promise<RepoData> {
  const repoDirPath = getRepoDirPath(modelId);
  const readme = getRepoReadme(repoDirPath);
  const repoSizes = await getRepoSizes(repoDirPath);

  return {
    size: {
      total: repoSizes.size,
      lfs: repoSizes.lfs,
    },
    readme,
  };
}

export function isRepoExisting(modelId: string): boolean {
  return fs.existsSync(getRepoDirPath(modelId));
}

export function getRepoDirPath(modelId: string) {
  return `${path.dirname(__dirname)}/repos/${modelId}`;
}

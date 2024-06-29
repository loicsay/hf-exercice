import fs from "fs";
import { simpleGit, type SimpleGit } from "simple-git";
import { algoliaIndex, formatModelDataToAlgolia } from "../algolia";
import { feature } from "../constants";
import {
  fetchHuggingFaceModelFromId,
  isErrorResponse,
  type WebhookBody,
} from "../huggingface";
import {
  cloneRepoAndGetData,
  getRepoData,
  getRepoDirPath,
  isRepoExisting,
} from "../repository/index";
import type { RepoData } from "../repository/types";

export function updateReposSync(webhookBody: WebhookBody) {
  const {
    event: { action },
    repo: { name: modelId },
  } = webhookBody;
  switch (action) {
    case "create":
      return createRepo(modelId);
    case "update":
      return updateRepo(modelId);
    case "delete":
      return deleteRepo(modelId);
    default:
      break;
  }

  if (!feature.isInitialReposSyncEnabled && isRepoExisting(modelId)) {
    fs.rmSync(getRepoDirPath(modelId), {
      recursive: true,
      force: true,
    });
    console.log(`[info] Repo ${modelId} successfully deleted.`);
  }

  return;
}

async function createRepo(modelId: string): Promise<void> {
  console.log(`[info] Creating repo from webhook for ${modelId}...`);
  const model = await fetchHuggingFaceModelFromId(modelId);
  if (isErrorResponse(model)) {
    console.log(`[error] Can't fetch model data: ${model.error}`);
    return;
  }

  if (isRepoExisting(modelId)) {
    fs.rmSync(getRepoDirPath(modelId), {
      recursive: true,
      force: true,
    });
  }
  const repoData = await cloneRepoAndGetData(model.id);
  if (feature.isAlgoliaIndexingEnabled) {
    await algoliaIndex.saveObject(
      formatModelDataToAlgolia({ model, repoData })
    );
    console.log(
      `[info] Indexing repo to Algolia from webhook for ${modelId} done`
    );
  }

  console.log(`[info] Repo created from webhook for ${modelId}`);
}

async function updateRepo(modelId: string): Promise<void> {
  console.log(`[info] Updating repo from webhook for ${modelId}...`);

  const model = await fetchHuggingFaceModelFromId(modelId);
  if (isErrorResponse(model)) {
    console.log(`[error] Can't fetch model data: ${model.error}`);
    return;
  }

  let repoData: RepoData;
  if (isRepoExisting(modelId)) {
    const git: SimpleGit = simpleGit().cwd(getRepoDirPath(modelId));
    await git.pull();
    repoData = await getRepoData(modelId);
  } else {
    repoData = await cloneRepoAndGetData(model.id);
  }
  if (feature.isAlgoliaIndexingEnabled) {
    await algoliaIndex.saveObject(
      formatModelDataToAlgolia({ model, repoData })
    );
    console.log(
      `[info] Updating index to Algolia from webhook for ${modelId} done`
    );
  }
  console.log(`[info] Repo updated from webhook for ${modelId}`);
}

async function deleteRepo(modelId: string): Promise<void> {
  console.log(`[info] Deleting repo from webhook for ${modelId}...`);
  if (isRepoExisting(modelId)) {
    fs.rmSync(getRepoDirPath(modelId), {
      recursive: true,
      force: true,
    });
  }
  if (feature.isAlgoliaIndexingEnabled) {
    console.log(
      `[info] Deleting index to Algolia from webhook for ${modelId} done`
    );
    await algoliaIndex.deleteObject(modelId);
  }
  console.log(`[info] Repo deleted from webhook for ${modelId}`);
}

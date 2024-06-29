import fs from "fs";
import path from "path";
import { algoliaIndex, formatModelDataToAlgolia } from "../algolia";
import { AUTHORS_REPOS_TO_INDEX, feature } from "../constants";
import { fetchHuggingFaceModelsFromAuthor } from "../huggingface";
import { cloneRepoAndGetData } from "../repository/index";

export async function initialReposSync() {
  console.log(`[info] Initial job running...`);

  fs.rmSync(`${path.dirname(__dirname)}/repos`, {
    recursive: true,
    force: true,
  });

  for (const author of AUTHORS_REPOS_TO_INDEX) {
    console.log(`[info] Clonning and indexing repos from ${author}...`);
    const err = await indexModelsFromAuthor(author);

    if (err) {
      console.log("[error] An error occured when initial job was running", err);
      return;
    }
    console.log(`[info] Successfully cloned and indexed repos from ${author}`);
  }

  console.log(`[info] Initial job successfully done`);
}

async function indexModelsFromAuthor(organisation: string): Promise<null> {
  let batchCount = 0;
  let cursor = null;

  do {
    const { models, nextCursor } = await fetchHuggingFaceModelsFromAuthor(
      organisation,
      cursor
    );
    cursor = nextCursor;

    let batchResult = await Promise.allSettled(
      models.map(async (model) => {
        const repoData = await cloneRepoAndGetData(model.id);
        return {
          model,
          repoData,
        };
      })
    );

    const successResult = batchResult.flatMap((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      }

      return [];
    });
    const failedResult = batchResult.filter(
      (result) => result.status === "rejected"
    );

    batchCount += successResult.length;

    if (feature.isAlgoliaIndexingEnabled) {
      try {
        await algoliaIndex.saveObjects(
          successResult.map((result) => formatModelDataToAlgolia(result))
        );
        console.log("[info] Indexed data to Algolia successfully");
      } catch (error) {
        console.log(
          "[error] Something happened when indexing data to Algolia",
          error
        );
      }
    }

    if (failedResult.length > 0) {
      console.log(`[error] ${failedResult.length} repo(s) not processed`, {
        failedResult,
      });
    }
    console.log(
      `[info] ${successResult.length} repo(s) processed, ${batchCount} in total`
    );
  } while (cursor);

  return null;
}

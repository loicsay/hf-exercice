import { type HFModel } from "./huggingface";
import { type RepoData } from "./repository/types";

import algoliasearch from "algoliasearch";

export const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_WRITE_KEY!
);

export const algoliaIndex = algoliaClient.initIndex(
  process.env.ALGOLIA_INDEX_NAME!
);

export function formatModelDataToAlgolia(data: {
  model: HFModel;
  repoData: RepoData;
}) {
  const {
    model: {
      id,
      author,
      createdAt,
      lastModified,
      sha,
      likes,
      downloads,
      tags,
      siblings,
    },
    repoData,
  } = data;

  return {
    objectID: id,
    readme: repoData.readme || "",
    size: repoData.size.total,
    author,
    id,
    createdAt,
    lastModified,
    sha,
    likes,
    downloads,
    tags,
    siblings,
  };
}

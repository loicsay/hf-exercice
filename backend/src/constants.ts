export const HUGGING_FACE_API_BASE_URL = "https://huggingface.co/api";

export const INDEXING_BATCH_SIZE = 100;

export const AUTHORS_REPOS_TO_INDEX = [
  "TheBloke",
  "tkcho",
  "MaziyarPanahi",
  "stefan-it",
  "apple",
  "stabilityai",
  "nvidia",
  "facebook",
  "google",
  "microsoft",
  "openai",
];

export const feature = {
  isInitialReposSyncEnabled: process.env.ENABLE_INITIAL_REPO_SYNC === "true",
  isHuggingFaceWebhookEnabled: process.env.ENABLE_HF_WEBHOOK === "true",
  isAlgoliaIndexingEnabled: process.env.ENABLE_ALGOLIA_INDEXING === "true",
};

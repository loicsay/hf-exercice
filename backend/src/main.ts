import "dotenv/config";
import express from "express";
import { feature } from "./constants";
import { initEndpoints } from "./controller";
import { initialReposSync } from "./use-cases/initial-repos-sync";

for (const envVariable of [
  "ALGOLIA_WRITE_KEY",
  "ALGOLIA_APP_ID",
  "ALGOLIA_INDEX_NAME",
]) {
  if (!process.env[envVariable]) {
    throw new Error(`[error] ${envVariable} is missing`);
  }
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

initEndpoints(app);

app.listen(port, () => {
  console.log(`[info] App ready and listening on port ${port}`);
  if (feature.isInitialReposSyncEnabled) {
    initialReposSync();
  }
});

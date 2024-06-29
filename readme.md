# 🤗 Hugging Face Code Exercise

**Build a search engine over git repos**

## Try Live

### Backend (https://hf-exercice-loicsay.up.railway.app)

> The deployed version of the backend doesn't run the first initial repos sync nor expose the webhook endpoint to keep the sync updated. See the "Run the backend locally" section to test these features.

The Algolia index used by the deployed backend has been filled previously by running this server locally: ~14,300 repos are indexed.

- `GET /repos`: get models and repos information. Query parameters available:
  - `search`: search keyword in all `readme.md` files.
  - `attribute`: attribute to filter, only `size` is available.
  - `gt`, `lt`, `equal`: greater than, less than, and equal operators. Values should be numbers representing the `size` in bytes.

### Frontend (https://hf-exercice-loicsay.vercel.app)

> The frontend uses Algolia packages and public search API key to create the search UI. The backend isn't used by the client for the search. It would be possible to do so, but it would require more time to implement the UI since it would be impossible to use [`react-instantsearch`](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/) components.

## Run the Backend Locally

### Prerequisite

1. If not already done, [create and set an SSH key to Hugging Face](https://huggingface.co/docs/hub/en/security-git-ssh).

2. Make sure to install [git-lfs CLI](https://git-lfs.com) first and navigate to the backend directory:

   ```
   cd backend
   ```

3. Then, install dependencies by running:

   ```
   yarn
   ```

4. Create a copy of `.env.dist` and name it `.env`. Make sure to fill the newly created file with these 3 environment variables from [Algolia](https://www.algolia.com/doc/guides/getting-started/what-is-algolia/):

   ```
   ALGOLIA_WRITE_KEY=
   ALGOLIA_APP_ID=
   ALGOLIA_INDEX_NAME=
   ```

5. You can now run the project locally, listening to port 3000:

   ```
   yarn dev
   ```

### Features

Three features can be enabled using feature flags, set in environment variables:

- `ENABLE_INITIAL_REPO_SYNC`: if set to true, this flag will make the server run the initial repos sync on start. All repos from organizations set in `backend/src/constants.ts` will be cloned locally. Moreover, enabling this feature will keep the repos sync up to date if the webhook feature is enabled. If disabled, repos are deleted after indexing.

- `ENABLE_HF_WEBHOOK`: if set to true, this flag will enable the `POST /repo` endpoint. This endpoint is the target for Hugging Face webhook, to keep the repo sync up to date. Enabling this feature requires the `HUGGING_FACE_WEBHOOK_KEY` variable to be set.

- `ENABLE_ALGOLIA_INDEXING`: if set to true, this flag will enable Algolia search indexing, for the initial repo sync and the webhook endpoint.

### Tests

#### Unit Testing

To run unit tests locally, run:

```
yarn test
```

#### Webhook

To test webhooks locally:

1. Install [ngrok](https://ngrok.com) and redirect `localhost:3000`. Copy the ngrok URL for step 3.

2. (Optional) Generate a secret and store it in the `backend/.env` file at `HUGGING_FACE_WEBHOOK_KEY`.

3. Create a [Hugging Face Webhook](https://huggingface.co/docs/hub/en/webhooks) and watch for all repos from organizations stored in `backend/src/constants.ts` at `ORGANISATIONS_TO_INDEX`. Use the ngrok URL from step 1 as the target URL (with `/repos` at the end) and fill the secret field if you created one in the previous step.

4. Either wait for a change or add your organization and make the change yourself to trigger the webhook.

#### Algolia

Connect to the [Algolia Dashboard](https://dashboard.algolia.com) to configure, search, and browse your records.

### Limitations & Improvements

#### Initial Repo Sync

It was asked to store > 10,000 repos: I'm unable to deploy instances with so many storage resources, so I only enable the initial repo sync and webhooks locally. Because of that, the deployed version of the server doesn't store any repos: it only indexes when a webhook event is triggered.

#### Indexing with Algolia

Indexing `readme.md` content implies big record sizes, but [Algolia records are limited](https://support.algolia.com/hc/en-us/articles/4406981897617-Is-there-a-size-limit-for-my-index-records). For big records, it is recommended to split them ([Algolia documentation here](https://www.algolia.com/doc/guides/sending-and-managing-data/prepare-your-data/how-to/indexing-long-documents/)). This process hasn't been done since only a few repos are impacted. It can be done as an improvement.

#### Hugging Face Gated Repos

Some repos are gated: for this version, they're ignored and not processed.

## Run the Frontend Locally

The frontend uses Vite, React.js, and TypeScript. To run it locally:

1. Navigate to the frontend directory:

   ```
   cd frontend
   ```

2. Then, install dependencies by running:

   ```
   yarn
   ```

3. Run the server:

   ```
   yarn dev
   ```

import parse from "parse-link-header";
import { HUGGING_FACE_API_BASE_URL, INDEXING_BATCH_SIZE } from "./constants";

export type HFModel = {
  _id: string;
  id: string;
  author: string;
  gated: false;
  lastModified: string;
  likes: number;
  private: boolean;
  sha: string;
  downloads: number;
  tags: string[];
  config: {
    architectures: string[];
    model_type: string;
  };
  library_name: string;
  createdAt: string;
  modelId: string;
  siblings: { rfilename: string }[];
};

type HFError = {
  error: string;
};

export type WebhookBody = {
  event: {
    action: string;
    scope: string;
  };
  repo: {
    type: string;
    name: string;
    id: string;
    private: boolean;
    url: {
      web: string;
      api: string;
    };
    headSha: string;
    owner: {
      id: string;
    };
  };
  webhook: {
    id: string;
    version: number;
  };
};

export async function fetchHuggingFaceModelsFromAuthor(
  author: string,
  cursor: string | null
): Promise<{ models: HFModel[]; nextCursor: string | null }> {
  const urlParams = new URLSearchParams({
    full: "true",
    limit: String(INDEXING_BATCH_SIZE),
    author,
    ...(cursor ? { cursor } : {}),
  });

  const response = await fetch(
    `${HUGGING_FACE_API_BASE_URL}/models?${urlParams}`
  );
  const headersLink = parse(response.headers.get("link"));
  const models: HFModel[] = await response.json();

  let nextCursor: string | null = null;
  if (headersLink?.next?.cursor) {
    nextCursor = headersLink.next.cursor;
  }

  return { models, nextCursor };
}

export async function fetchHuggingFaceModelFromId(
  modelId: string
): Promise<HFModel | HFError> {
  const urlParams = new URLSearchParams({
    full: "true",
  });

  const response = await fetch(
    `${HUGGING_FACE_API_BASE_URL}/models/${modelId}?${urlParams}`
  );
  const model: HFModel | HFError = await response.json();

  return model;
}

export function isErrorResponse(response: any): response is HFError {
  return (response as HFError).error !== undefined;
}

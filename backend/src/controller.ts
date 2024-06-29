import "dotenv/config";
import type { Express, Request, Response } from "express";
import { algoliaIndex } from "./algolia";
import { feature } from "./constants";
import type { WebhookBody } from "./huggingface";
import { updateReposSync } from "./use-cases/update-repos-sync";

export function initEndpoints(app: Express) {
  app.get("/repos", handleGetRepos);

  if (feature.isHuggingFaceWebhookEnabled) {
    app.post("/repos", handleWebhook);
  }
}

async function handleGetRepos(
  req: Request<
    unknown,
    unknown,
    unknown,
    {
      attribute?: string;
      gt?: string;
      lt?: string;
      equal?: string;
      search?: string;
    }
  >,
  res: Response
) {
  const { attribute, gt, lt, equal, search } = req.query;
  if (!attribute && !gt && !lt && !equal) {
    const hits = await algoliaIndex.search(search || "");

    return res.status(200).send(hits);
  }

  if (attribute === "size" && (gt || lt || equal)) {
    const value = Number(gt || lt || equal);
    if (isNaN(value)) {
      return res.status(422).send("Wrong value for operator");
    }
    let operator = "gt";
    if (lt) {
      operator = "lt";
    }
    if (equal) {
      operator = "equal";
    }
    const hits = await algoliaIndex.search(search || "", {
      filters: `${attribute} ${operatorToSymbol(operator)} ${value}`,
    });

    return res.status(200).send(hits);
  }

  return res.status(422).send("Wrong parameters");
}

async function handleWebhook(req: Request, res: Response) {
  if (
    req.headers["x-webhook-secret"] !== process.env.HUGGING_FACE_WEBHOOK_KEY
  ) {
    console.log("[error] Wrong secret for webhook endpoint");
    return res.status(401).send("Unauthorized");
  }

  const webhookBody: WebhookBody = req.body;
  try {
    updateReposSync(webhookBody);

    return res.status(201).send("OK");
  } catch (error) {
    console.log(`[error] Webhook handling failed`, { error });
    return res.status(500).send();
  }
}

function operatorToSymbol(operator: string): string {
  switch (operator) {
    case "gt":
      return ">";
    case "lt":
      return "<";
    case "equal":
      return "=";
    default:
      return "";
  }
}

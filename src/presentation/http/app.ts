import express from "express";
import { AppContainer } from "../composition-root/container.js";
import { fail, ok } from "./contracts/api-result.js";
import { buildPipelineRoutes } from "./routes/pipeline.routes.js";
import { errorHandler } from "./errors/error-handler.js";
import { buildWebhookRoutes } from "./routes/webhook.routes.js";

export function createApp(container: AppContainer) {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    return res.status(200).json(ok({ status: "ok" }, "Service healthy"));
  });

  app.use("/api/pipelines", buildPipelineRoutes(container));
  app.use("/api/webhooks", buildWebhookRoutes(container));

  app.use((_req, res) => {
    return res.status(404).json(fail("Route not found"));
  });

  app.use(errorHandler);

  return app;
}

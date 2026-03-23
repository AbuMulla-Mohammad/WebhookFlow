import express from "express";
import { AppContainer } from "../composition-root/container.js";
import { fail, ok } from "./contracts/api-result.js";
import { buildPipelineRoutes } from "./routes/pipeline.routes.js";
import { errorHandler } from "./errors/error-handler.js";
import { buildWebhookRoutes } from "./routes/webhook.routes.js";
import { buildJobRoutes } from "./routes/job.routes.js";
import { buildDeliveryAttemptRoutes } from "./routes/delivery-attempt.routes.js";
import { rateLimiterMiddleware } from "./middlewares/rate-limiter.middleware.js";
import { buildAuthRoutes } from "./routes/auth.routes.js";
import { authenticate } from "./middlewares/authenticate.middleware.js";

export function createApp(container: AppContainer) {
  const app = express();
  app.use(express.json());

  app.use(rateLimiterMiddleware);

  app.get("/health", (_req, res) => {
    return res.status(200).json(ok({ status: "ok" }, "Service healthy"));
  });
  app.use("/api/auth", buildAuthRoutes(container));

  app.use("/api/pipelines", authenticate, buildPipelineRoutes(container));
  app.use("/api/webhooks", authenticate, buildWebhookRoutes(container));
  app.use("/api/jobs", authenticate, buildJobRoutes(container));
  app.use(
    "/api/delivery-attempts",
    authenticate,
    buildDeliveryAttemptRoutes(container),
  );

  app.use((_req, res) => {
    return res.status(404).json(fail("Route not found"));
  });

  app.use(errorHandler);

  return app;
}

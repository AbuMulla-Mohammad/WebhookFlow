import { Router } from "express";
import { AppContainer } from "../../../presentation/composition-root/container.js";
import { validateBody } from "../middlewares/validateMiddleware.js";
import { validateParams } from "../middlewares/validateParamsMiddleware.js";
import { webhookPathParamsSchema } from "../validators/pipeline-params.validator.js";
import { triggerWebhookBodySchema } from "../validators/trigger-webhook.validator.js";

export function buildWebhookRoutes(container: AppContainer): Router {
  const router = Router();

  router.post(
    "/:webhookPath",
    validateParams(webhookPathParamsSchema),
    validateBody(triggerWebhookBodySchema),
    container.controllers.Webhook.triggerWebhook,
  );

  return router;
}

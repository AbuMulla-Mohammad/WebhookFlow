import { Router } from "express";
import { AppContainer } from "../../../presentation/composition-root/container.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { validateParams } from "../middlewares/validate-params.middleware.js";
import { webhookPathParamsSchema } from "../validators/pipeline.validators.js";
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

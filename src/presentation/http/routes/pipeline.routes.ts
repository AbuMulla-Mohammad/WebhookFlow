import { Router } from "express";
import { AppContainer } from "../../../presentation/composition-root/container.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { validateParams } from "../middlewares/validate-params.middleware.js";
import {
  addSubscriberSchema,
  createPipelineSchema,
  pipelineIdParamsSchema,
  removePipelineSubscriberParamsSchema,
  updatePipelineSchema,
  webhookPathParamsSchema,
} from "../validators/pipeline.validators.js";
import { validateQuery } from "../middlewares/validate-query.middleware.js";
import { paginationSchema } from "../../../shared/validators/pagination.validators.js";
import { authorize } from "../middlewares/authorize.middleware.js";

export function buildPipelineRoutes(container: AppContainer): Router {
  const router = Router();

  router.get(
    "/",
    validateQuery(paginationSchema),
    container.controllers.Pipeline.getAllPipelines,
  );

  router.post(
    "/",
    authorize("admin"),
    validateBody(createPipelineSchema),
    container.controllers.Pipeline.createPipeline,
  );

  router.put(
    "/:pipelineId",
    authorize("admin"),
    validateParams(pipelineIdParamsSchema),
    validateBody(updatePipelineSchema),
    container.controllers.Pipeline.updatePipeline,
  );

  router.get(
    "/:pipelineId",
    validateParams(pipelineIdParamsSchema),
    container.controllers.Pipeline.getPipelineById,
  );

  router.get(
    "/webhook/:webhookPath",
    validateParams(webhookPathParamsSchema),
    container.controllers.Pipeline.getPipelineByWebhookPath,
  );

  router.post(
    "/:pipelineId/subscribers",
    authorize("admin"),
    validateParams(pipelineIdParamsSchema),
    validateBody(addSubscriberSchema),
    container.controllers.Pipeline.addSubscriber,
  );

  router.delete(
    "/:pipelineId/subscribers/:subscriberId",
    authorize("admin"),
    validateParams(removePipelineSubscriberParamsSchema),
    container.controllers.Pipeline.removeSubscriber,
  );
  return router;
}

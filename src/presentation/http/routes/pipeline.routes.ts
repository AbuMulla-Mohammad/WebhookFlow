import { Router } from "express";
import { AppContainer } from "../../../presentation/composition-root/container.js";
import { validateBody } from "../middlewares/validateMiddleware.js";
import { createPipelineSchema } from "../validators/create-pipeline.validator.js";
import { updatePipelineSchema } from "../validators/update-pipeline.validator.js";
import { validateParams } from "../middlewares/validateParamsMiddleware.js";
import { pipelineIdParamsSchema } from "../validators/pipeline-params.validator.js";

export function buildPipelineRoutes(container: AppContainer): Router {
  const router = Router();

  router.post(
    "/",
    validateBody(createPipelineSchema),
    container.controllers.Pipeline.createPipeline,
  );

  router.put(
    "/:pipelineId",
    validateParams(pipelineIdParamsSchema),
    validateBody(updatePipelineSchema),
    container.controllers.Pipeline.updatePipeline,
  );

  router.get(
    "/:pipelineId",
    validateParams(pipelineIdParamsSchema),
    container.controllers.Pipeline.getPipelineById,
  );
  return router;
}

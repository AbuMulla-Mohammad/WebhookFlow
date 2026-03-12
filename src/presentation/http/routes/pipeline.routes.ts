import { Router } from "express";
import { AppContainer } from "../../../presentation/composition-root/container.js";
import { validateBody } from "../middlewares/validateMiddleware.js";
import { createPipelineSchema } from "../validators/create-pipeline.validator.js";

export function buildPipelineRoutes(container: AppContainer): Router {
  const router = Router();

  router.post(
    "/",
    validateBody(createPipelineSchema),
    container.controllers.Pipeline.createPipeline,
  );

  return router;
}

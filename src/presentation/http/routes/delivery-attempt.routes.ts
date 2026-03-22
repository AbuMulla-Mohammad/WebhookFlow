import { Router } from "express";
import { AppContainer } from "../../../presentation/composition-root/container.js";
import { validateParams } from "../middlewares/validateParamsMiddleware.js";
import { jobIdParamsSchema } from "../validators/job.validators";
import { attemptIdParamsSchema } from "../validators/delivery-attempt.validators.js";

export function buildDeliveryAttemptRoutes(container: AppContainer): Router {
  const router = Router();
  const controller = container.controllers.DeliveryAttempt;
  router.get(
    "/jobs/:jobId/delivery-attempts",
    validateParams(jobIdParamsSchema),
    container.controllers.DeliveryAttempt.getByJob,
  );
  router.get(
    "/delivery-attempts/:attemptId",
    validateParams(attemptIdParamsSchema),
    container.controllers.DeliveryAttempt.getById,
  );
  return router;
}

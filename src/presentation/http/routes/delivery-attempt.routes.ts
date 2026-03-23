import { Router } from "express";
import { AppContainer } from "../../../presentation/composition-root/container.js";
import { validateParams } from "../middlewares/validate-params.middleware.js";
import { attemptIdParamsSchema } from "../validators/delivery-attempt.validators.js";

export function buildDeliveryAttemptRoutes(container: AppContainer): Router {
  const router = Router();
  router.get(
    "/:attemptId",
    validateParams(attemptIdParamsSchema),
    container.controllers.DeliveryAttempt.getById,
  );
  return router;
}

import { Router } from "express";
import { validateParams } from "../middlewares/validateParamsMiddleware.js";
import {
  jobIdParamsSchema,
  jobStatusParamsSchema,
} from "../validators/job.validators.js";
import { AppContainer } from "../../../presentation/composition-root/container.js";
import { validateQuery } from "../middlewares/validateQueryMiddleware.js";
import { paginationSchema } from "../../../shared/validators/pagination.validators.js";

export function buildJobRoutes(container: AppContainer): Router {
  const router = Router();

  router.get(
    "/",
    validateQuery(paginationSchema),
    container.controllers.Job.getAllJobs,
  );

  router.get(
    "/:jobId",
    validateParams(jobIdParamsSchema),
    container.controllers.Job.getJobById,
  );

  router.get(
    "/status/:jobStatus",
    validateParams(jobStatusParamsSchema),
    container.controllers.Job.getJobsByStatus,
  );

  router.get(
    "/:jobId/delivery-attempts",
    validateParams(jobIdParamsSchema),
    container.controllers.Job.getDeliveryAttemptsByJob,
  );

  return router;
}

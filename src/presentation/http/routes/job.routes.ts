import { Router } from "express";
import { validateParams } from "../middlewares/validate-params.middleware.js";
import {
  jobIdParamsSchema,
  jobStatusParamsSchema,
} from "../validators/job.validators.js";
import { AppContainer } from "../../../presentation/composition-root/container.js";
import { validateQuery } from "../middlewares/validate-query.middleware.js";
import { paginationSchema } from "../../../shared/validators/pagination.validators.js";
import { authorize } from "../middlewares/authorize.middleware.js";

export function buildJobRoutes(container: AppContainer): Router {
  const router = Router();

  router.get(
    "/",
    authorize("admin"),
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

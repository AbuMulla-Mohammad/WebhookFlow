import { NextFunction, Request, Response } from "express";
import { GetAllJobsUseCase } from "../../../application/job/use-cases/get-all-jobs.use-case.js";
import { GetJobByIdUseCase } from "../../../application/job/use-cases/get-job-by-id.use-case.js";
import { ok } from "../contracts/api-result.js";
import { GetJobByStatusUseCase } from "../../../application/job/use-cases/get-jobs-by-status.use-case.js";
import { JobStatus } from "../../../domain/types/job-status.js";
import { JobIdParams, JobStatusParams } from "../validators/job.validators.js";
import { GetDeliveryAttemptsByJobUseCase } from "../../../application/job/use-cases/get-delivery-attempts-by-job.use-case.js";
import { PaginationQuery } from "../../../shared/validators/pagination.validators.js";

export class JobController {
  constructor(
    private readonly getJobByIdUseCase: GetJobByIdUseCase,
    private readonly getAllJobsUseCase: GetAllJobsUseCase,
    private readonly getJobsByStatusUseCase: GetJobByStatusUseCase,
    private readonly getDeliveryAttemptsByJobUseCase: GetDeliveryAttemptsByJobUseCase,
  ) {}

  getJobById = async (
    req: Request<{ jobId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params: JobIdParams = req.params;
      const result = await this.getJobByIdUseCase.execute(
        params.jobId,
        req.user!,
      );
      res.status(200).json(ok(result, "Job retrieved"));
    } catch (error) {
      return next(error);
    }
  };

  getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = req.query as unknown as PaginationQuery;
      const result = await this.getAllJobsUseCase.execute(
        req.user!,
        Number(limit),
        Number(offset),
      );
      res.status(200).json(ok(result, "Jobs retrieved"));
    } catch (error) {
      return next(error);
    }
  };

  getJobsByStatus = async (
    req: Request<{ jobStatus: JobStatus }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { jobStatus } = req.params as JobStatusParams;
      const { limit, offset } = req.query as unknown as PaginationQuery;
      const result = await this.getJobsByStatusUseCase.execute(
        jobStatus,
        req.user!,
        Number(limit),
        Number(offset),
      );
      res.status(200).json(ok(result, "Jobs retrieved"));
    } catch (error) {
      return next(error);
    }
  };

  getDeliveryAttemptsByJob = async (
    req: Request<{ jobId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params: JobIdParams = req.params;
      const result = await this.getDeliveryAttemptsByJobUseCase.execute(
        params.jobId,
        req.user!,
      );
      res.status(200).json(ok(result, "Delivery attempts retrieved"));
    } catch (error) {
      return next(error);
    }
  };
}

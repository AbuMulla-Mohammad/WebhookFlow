import { NextFunction, Request, Response } from "express";
import { GetAllJobsUseCase } from "../../../application/job/use-cases/get-all-jobs.use-case.js";
import { GetJobByIdUseCase } from "../../../application/job/use-cases/get-job-by-id.use-case.js";
import { ok } from "../contracts/api-result";
import { GetJobByStatusUseCase } from "../../../application/job/use-cases/get-jobs-by-status.use-case.js";
import { JobStatus } from "../../../domain/types/job-status.js";
import {
  JobIdParams,
  JobStatusParams,
  PaginationQuery,
} from "../validators/job.validators.js";

export class JobController {
  constructor(
    private readonly getJobByIdUseCase: GetJobByIdUseCase,
    private readonly getAllJobsUseCase: GetAllJobsUseCase,
    private readonly getJobsByStatusUseCase: GetJobByStatusUseCase,
  ) {}
  getJobById = async (
    req: Request<{ jobId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params: JobIdParams = req.params;
      const result = await this.getJobByIdUseCase.execute(params.jobId);
      res.status(200).json(ok(result, "Job retrieved"));
    } catch (error) {
      return next(error);
    }
  };

  getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = req.query as unknown as PaginationQuery;
      const result = await this.getAllJobsUseCase.execute(
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
        Number(limit),
        Number(offset),
      );
      res.status(200).json(ok(result, "Jobs retrieved"));
    } catch (error) {
      return next(error);
    }
  };
}

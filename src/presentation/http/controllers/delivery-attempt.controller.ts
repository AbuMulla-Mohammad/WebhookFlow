import { Request, Response, NextFunction } from "express";
import { GetDeliveryAttemptsByJobUseCase } from "../../../application/job/use-cases/get-delivery-attempts-by-job.use-case.js";
import { GetDeliveryAttemptByIdUseCase } from "../../../application/job/use-cases/get-delivery-attempt-by-id.use-case.js";
import { ok } from "../contracts/api-result.js";
import { JobIdParams } from "../validators/job.validators.js";
import { AttemptIdParams } from "../validators/delivery-attempt.validators.js";

export class DeliveryAttemptController {
  constructor(
    private readonly getDeliveryAttemptsByJobUseCase: GetDeliveryAttemptsByJobUseCase,
    private readonly getDeliveryAttemptByIdUseCase: GetDeliveryAttemptByIdUseCase,
  ) {}

  getByJob = async (
    req: Request<{ jobId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params: JobIdParams = req.params;
      const result = await this.getDeliveryAttemptsByJobUseCase.execute(
        params.jobId,
      );
      res.status(200).json(ok(result, "Delivery attempts retrieved"));
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request<{ attemptId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params: AttemptIdParams = req.params;
      const result = await this.getDeliveryAttemptByIdUseCase.execute(
        params.attemptId,
      );
      res.status(200).json(ok(result, "Delivery attempt retrieved"));
    } catch (error) {
      next(error);
    }
  };
}

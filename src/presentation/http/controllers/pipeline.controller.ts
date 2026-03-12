import { NextFunction, Request, Response } from "express";
import { CreatePipelineUseCase } from "../../../application/pipeline/use-cases/create-pipeline.use-case.js";
import { UpdatePipelineUseCase } from "../../../application/pipeline/use-cases/update-pipeline.use-case.js";
import { ok } from "../contracts/api-result.js";

export class PipelineController {
  constructor(
    private readonly createPipelineUseCase: CreatePipelineUseCase,
    private readonly updatePipelineUseCase: UpdatePipelineUseCase,
  ) {}

  createPipeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.createPipelineUseCase.execute(req.body);
      return res.status(201).json(ok(result, "Pipeline created"));
    } catch (error) {
      return next(error);
    }
  };

  updatePipeline = async (
    req: Request<{ pipelineId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.updatePipelineUseCase.execute(
        req.body,
        req.params.pipelineId,
      );
      return res.status(200).json(ok(result, "Pipeline updated"));
    } catch (error) {
      return next(error);
    }
  };
}

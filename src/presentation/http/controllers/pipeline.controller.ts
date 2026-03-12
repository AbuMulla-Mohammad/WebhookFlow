import { NextFunction, Request, Response } from "express";
import { CreatePipelineUseCase } from "../../../application/pipeline/use-cases/create-pipeline.use-case.js";
import { ok } from "../contracts/api-result.js";

export class PipelineController {
  constructor(private readonly createPipelineUseCase: CreatePipelineUseCase) {}
  createPipeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.createPipelineUseCase.execute(req.body);
      return res.status(201).json(ok(result, "Pipeline created"));
    } catch (error) {
      return next(error);
    }
  };
}

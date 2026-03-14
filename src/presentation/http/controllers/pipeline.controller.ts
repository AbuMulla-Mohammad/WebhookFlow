import { NextFunction, Request, Response } from "express";
import { CreatePipelineUseCase } from "../../../application/pipeline/use-cases/create-pipeline.use-case.js";
import { UpdatePipelineUseCase } from "../../../application/pipeline/use-cases/update-pipeline.use-case.js";
import { ok } from "../contracts/api-result.js";
import { GetPipelineByIdUseCase } from "../../../application/pipeline/use-cases/get-pipeline-by-id.use-case.js";
import { GetPipelineByWebhookPathUseCase } from "../../../application/pipeline/use-cases/get-pipeline-by-webhook-path.use-case.js";
import { AddSubscriberUseCase } from "src/application/pipeline/use-cases/add-subscriber.use-case.js";
import { RemoveSubscriberUseCase } from "src/application/pipeline/use-cases/remove-subscriber.use-case.js";

export class PipelineController {
  constructor(
    private readonly createPipelineUseCase: CreatePipelineUseCase,
    private readonly updatePipelineUseCase: UpdatePipelineUseCase,
    private readonly getPipelineByIdUseCase: GetPipelineByIdUseCase,
    private readonly getPipelineByWebhookPathUseCase: GetPipelineByWebhookPathUseCase,
    private readonly addSubscriberUseCase: AddSubscriberUseCase,
    private readonly removeSubscriberUseCase: RemoveSubscriberUseCase,
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

  getPipelineById = async (
    req: Request<{ pipelineId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.getPipelineByIdUseCase.execute(
        req.params.pipelineId,
      );
      return res.status(200).json(ok(result, "Pipeline retrieved"));
    } catch (error) {
      return next(error);
    }
  };

  getPipelineByWebhookPath = async (
    req: Request<{ webhookPath: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.getPipelineByWebhookPathUseCase.execute(
        req.params.webhookPath,
      );
      return res.status(200).json(ok(result, "Pipeline retrieved"));
    } catch (error) {
      return next(error);
    }
  };

  addSubscriber = async (
    req: Request<{ pipelineId: string }, unknown, { targetUrl: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.addSubscriberUseCase.execute(
        req.params.pipelineId,
        req.body.targetUrl,
      );
      return res.status(201).json(ok(result, "Subscriber added"));
    } catch (error) {
      return next(error);
    }
  };

  removeSubscriber = async (
    req: Request<{ pipelineId: string; subscriberId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.removeSubscriberUseCase.execute(
        req.params.pipelineId,
        req.params.subscriberId,
      );
      return res.status(200).json(ok({ removed: true }, "Subscriber removed"));
    } catch (error) {
      return next(error);
    }
  };
}

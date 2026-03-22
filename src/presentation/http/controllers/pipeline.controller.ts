import { NextFunction, Request, Response } from "express";
import { CreatePipelineUseCase } from "../../../application/pipeline/use-cases/create-pipeline.use-case.js";
import { UpdatePipelineUseCase } from "../../../application/pipeline/use-cases/update-pipeline.use-case.js";
import { ok } from "../contracts/api-result.js";
import { GetPipelineByIdUseCase } from "../../../application/pipeline/use-cases/get-pipeline-by-id.use-case.js";
import { GetPipelineByWebhookPathUseCase } from "../../../application/pipeline/use-cases/get-pipeline-by-webhook-path.use-case.js";
import { AddSubscriberUseCase } from "../../../application/pipeline/use-cases/add-subscriber.use-case.js";
import { RemoveSubscriberUseCase } from "../../../application/pipeline/use-cases/remove-subscriber.use-case.js";
import {
  AddSubscriberBody,
  CreatePipelineBody,
  PipelineIdParams,
  RemovePipelineSubscriberParams,
  UpdatePipelineBody,
  WebhookPathParams,
} from "../validators/pipeline.validators.js";
import { GetAllPipelinesUseCase } from "../../../application/pipeline/use-cases/get-all-pipelines.use-case.js";
import { PaginationQuery } from "../../../shared/validators/pagination.validators.js";

export class PipelineController {
  constructor(
    private readonly createPipelineUseCase: CreatePipelineUseCase,
    private readonly updatePipelineUseCase: UpdatePipelineUseCase,
    private readonly getPipelineByIdUseCase: GetPipelineByIdUseCase,
    private readonly getPipelineByWebhookPathUseCase: GetPipelineByWebhookPathUseCase,
    private readonly addSubscriberUseCase: AddSubscriberUseCase,
    private readonly removeSubscriberUseCase: RemoveSubscriberUseCase,
    private readonly getAllPipelinesUseCase: GetAllPipelinesUseCase,
  ) {}

  createPipeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: CreatePipelineBody = req.body;
      const result = await this.createPipelineUseCase.execute(body);
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
      const body: UpdatePipelineBody = req.body;
      const params: PipelineIdParams = req.params;
      const result = await this.updatePipelineUseCase.execute(
        body,
        params.pipelineId,
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
      const params: PipelineIdParams = req.params;
      const result = await this.getPipelineByIdUseCase.execute(
        params.pipelineId,
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
      const params: WebhookPathParams = req.params;
      const result = await this.getPipelineByWebhookPathUseCase.execute(
        params.webhookPath,
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
      const params: PipelineIdParams = req.params;
      const body: AddSubscriberBody = req.body;
      const result = await this.addSubscriberUseCase.execute(
        params.pipelineId,
        body.targetUrl,
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
      const params: RemovePipelineSubscriberParams = req.params;
      await this.removeSubscriberUseCase.execute(
        params.pipelineId,
        params.subscriberId,
      );
      return res.status(200).json(ok({ removed: true }, "Subscriber removed"));
    } catch (error) {
      return next(error);
    }
  };
  getAllPipelines = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = req.query as unknown as PaginationQuery;
      const result = await this.getAllPipelinesUseCase.execute(
        Number(limit),
        Number(offset),
      );
      res.status(200).json(ok(result, "Pipelines retrieved"));
    } catch (error) {
      next(error);
    }
  };
}

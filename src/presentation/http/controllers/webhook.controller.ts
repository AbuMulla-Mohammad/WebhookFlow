import { NextFunction, Request, Response } from "express";
import { TriggerWebhookUseCase } from "../../../application/pipeline/use-cases/trigger-webhook.use-case.js";
import { ok } from "../contracts/api-result.js";

export class WebhookController {
  constructor(private readonly triggerWebhookUseCase: TriggerWebhookUseCase) {}
  triggerWebhook = async (
    req: Request<{ webhookPath: string }, unknown, Record<string, unknown>>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.triggerWebhookUseCase.execute(
        req.params.webhookPath,
        req.body,
      );

      return res.status(202).json(ok(result, "Webhook accepted"));
    } catch (error) {
      return next(error);
    }
  };
}

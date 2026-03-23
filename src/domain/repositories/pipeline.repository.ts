import { Pipeline } from "../entities/pipeline.js";
import { Subscriber } from "../entities/subscriber.js";

export type PipelineWithSubscribers = Pipeline & {
  subscribers: Subscriber[];
};

export interface PipelineRepository {
  getById(id: string): Promise<Pipeline | null>;
  getByIdWithSubscribers(id: string): Promise<PipelineWithSubscribers | null>;
  getByWebhookPath(path: string): Promise<Pipeline | null>;
  getByWebhookPathWithSubscribers(
    path: string,
  ): Promise<PipelineWithSubscribers | null>;
  getAll(limit?: number, offset?: number): Promise<Pipeline[]>;
  save(pipeline: Pipeline): Promise<Pipeline>;
  update(pipeline: Pipeline): Promise<Pipeline>;
}

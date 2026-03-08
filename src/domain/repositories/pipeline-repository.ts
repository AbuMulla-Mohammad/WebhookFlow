import { Pipeline } from "../entities/pipeline";

export interface PipelineRepository {
  getById(id: string): Promise<Pipeline | null>;
  getByWebhookPath(path: string): Promise<Pipeline | null>;
  getAll(): Promise<Pipeline[]>;
  save(pipeline: Pipeline): Promise<Pipeline>;
}

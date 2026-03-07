import { BaseEntity } from "./base-entity";

export interface Subscriber extends BaseEntity {
  pipelineId: string;
  targetUrl: string;
}

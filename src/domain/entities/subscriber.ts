import { BaseEntity } from "./base-entity.js";

export interface Subscriber extends BaseEntity {
  pipelineId: string;
  targetUrl: string;
}

import { BaseEntity } from "./base-entity";

export interface Pipeline extends BaseEntity {
  name: string;
  description: string;
  webhookPath: string;
  actionId: string;
}

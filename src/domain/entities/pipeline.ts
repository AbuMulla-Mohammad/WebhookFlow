import { ActionType } from "../types/action-type";
import { BaseEntity } from "./base-entity";

export interface Pipeline extends BaseEntity {
  name: string;
  description: string;
  webhookPath: string;
  actionType: ActionType;
}

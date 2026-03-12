import { ActionType } from "../types/action-type.js";
import { BaseEntity } from "./base-entity.js";

export interface Pipeline extends BaseEntity {
  name: string;
  description: string;
  webhookPath: string;
  actionType: ActionType;
}

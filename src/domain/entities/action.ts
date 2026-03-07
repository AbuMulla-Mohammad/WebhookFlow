import { ActionType } from "../types/action-type";
import { BaseEntity } from "./base-entity";

export interface Action extends BaseEntity {
  type: ActionType;
  config: Record<string, unknown>;
}

import { ActionType } from "../../domain/types/action-type.js";

export interface ActionHandler {
  type: ActionType;
  execute(payload: Record<string, unknown>): Promise<Record<string, unknown>>;
}

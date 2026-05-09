import { ActionType } from "src/domain/types/action-type";

export interface ActionHandler {
  type: ActionType;
  execute(payload: Record<string, unknown>): Promise<Record<string, unknown>>;
}

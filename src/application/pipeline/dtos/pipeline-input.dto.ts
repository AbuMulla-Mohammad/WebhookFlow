import { ActionType } from "../../../domain/types/action-type.js";

export interface PipelineInputDto {
  name: string;
  description: string;
  webhookPath: string;
  actionType: ActionType;
  subscribers: string[];
}

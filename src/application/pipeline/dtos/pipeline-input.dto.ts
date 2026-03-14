import { ActionType } from "src/domain/types/action-type";

export interface PipelineInputDto {
  name: string;
  description: string;
  webhookPath: string;
  actionType: ActionType;
  subscribers: string[];
}

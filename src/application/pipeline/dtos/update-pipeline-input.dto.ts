import { ActionType } from "../../../domain/types/action-type.js";

export interface UpdatePipelineInputDto {
  name?: string;
  description?: string;
  webhookPath?: string;
  actionType?: ActionType;
}

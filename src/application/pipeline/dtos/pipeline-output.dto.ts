import { ActionType } from "../../../domain/types/action-type.js";
import { SubscriberListOutputDto } from "./subscriber-list-output.dto.js";

export interface PipelineOutputDto {
  id: string;
  name: string;
  description?: string;
  webhookPath: string;
  actionType?: ActionType;
  createdAt: Date;
  updatedAt?: Date;
  subscribers?: SubscriberListOutputDto[];
}

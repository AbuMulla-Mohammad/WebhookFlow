import { DeliveryStatus } from "../types/delivery-status.js";
import { BaseEntity } from "./base-entity.js";

export interface DeliveryAttempt extends BaseEntity {
  jobId: string;
  errorMessage?: string;
  subscriberId: string;
  responseCode?: number;
  attemptNumber: number;
  status: DeliveryStatus;
}

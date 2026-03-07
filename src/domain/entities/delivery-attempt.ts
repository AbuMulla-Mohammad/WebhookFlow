import { DeliveryStatus } from "../types/delivery-status";
import { BaseEntity } from "./base-entity";

export interface DeliveryAttempt extends BaseEntity {
  jobId: string;
  errorMessage?: string;
  subscriberId: string;
  responseCode?: number;
  attemptNumber: number;
  status: DeliveryStatus;
}

import { DeliveryStatus } from "../../../domain/types/delivery-status.js";

export interface DeliveryAttemptOutputDto {
  id: string;
  jobId: string;
  subscriberId: string;
  status: DeliveryStatus;
  attemptNumber: number;
  responseCode?: number;
  errorMessage?: string;
  createdAt: Date;
}

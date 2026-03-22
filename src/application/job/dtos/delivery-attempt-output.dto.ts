import { DeliveryStatus } from "src/domain/types/delivery-status";

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

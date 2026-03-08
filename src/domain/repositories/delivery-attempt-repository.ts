import { DeliveryAttempt } from "../entities/delivery-attempt";

export interface DeliveryAttemptRepository {
  save(attempt: DeliveryAttempt): Promise<void>;
  getById(id: string): Promise<DeliveryAttempt | null>;
  getByJobId(jobId: string): Promise<DeliveryAttempt[]>;
  getBySubscriberId(subscriberId: string): Promise<DeliveryAttempt[]>;
  getFailedAttempts(limit?: number): Promise<DeliveryAttempt[]>;
}

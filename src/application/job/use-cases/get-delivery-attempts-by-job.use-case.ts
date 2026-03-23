import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { DeliveryAttemptRepository } from "../../../domain/repositories/delivery-attempt.repository.js";
import { JobRepository } from "../../../domain/repositories/job.repository.js";
import { DeliveryAttemptOutputDto } from "../dtos/delivery-attempt-output.dto.js";
import { RequestingUser } from "../../../application/types/requesting-user.js";

export class GetDeliveryAttemptsByJobUseCase {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly deliveryAttemptRepository: DeliveryAttemptRepository,
  ) {}

  async execute(
    jobId: string,
    requestingUser: RequestingUser,
  ): Promise<DeliveryAttemptOutputDto[]> {
    const job = await this.jobRepository.getById(jobId);
    if (!job) {
      throw new NotFoundError("Job was not found.");
    }

    if (
      requestingUser.role !== "admin" &&
      job.triggeredBy !== requestingUser.id
    ) {
      throw new NotFoundError("Job was not found.");
    }

    const attempts = await this.deliveryAttemptRepository.getByJobId(jobId);

    return attempts.map((a) => ({
      id: a.id,
      jobId: a.jobId,
      subscriberId: a.subscriberId,
      status: a.status,
      attemptNumber: a.attemptNumber,
      responseCode: a.responseCode,
      errorMessage: a.errorMessage,
      createdAt: a.createdAt,
    }));
  }
}

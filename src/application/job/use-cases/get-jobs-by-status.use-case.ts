import { RequestingUser } from "../../../application/types/requesting-user.js";
import { JobRepository } from "../../../domain/repositories/job.repository.js";
import { JobStatus } from "../../../domain/types/job-status.js";
import { JobOutputDto } from "../dtos/job-output.dto.js";

export class GetJobByStatusUseCase {
  constructor(private readonly jobRepository: JobRepository) {}
  async execute(
    status: JobStatus,
    requestingUser?: RequestingUser,
    limit?: number,
    offset?: number,
  ): Promise<JobOutputDto[]> {
    if (requestingUser?.role === "admin") {
      return this.jobRepository.getByStatus(status, limit, offset);
    }

    return this.jobRepository.getByStatusAndTriggeredBy(
      status,
      requestingUser!.id,
      limit,
      offset,
    );
  }
}

import { JobRepository } from "../../../domain/repositories/job.repository.js";
import { JobStatus } from "../../../domain/types/job-status.js";
import { JobOutputDto } from "../dtos/job-output.dto.js";

export class GetJobByStatusUseCase {
  constructor(private readonly jobRepository: JobRepository) {}
  async execute(
    status: JobStatus,
    limit?: number,
    offset?: number,
  ): Promise<JobOutputDto[]> {
    const result = await this.jobRepository.getByStatus(status, limit, offset);
    return result;
  }
}

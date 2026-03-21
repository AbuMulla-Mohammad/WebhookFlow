import { JobRepository } from "src/domain/repositories/job-repository";
import { JobStatus } from "src/domain/types/job-status";
import { JobOutputDto } from "../dtos/job-output.dto";

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

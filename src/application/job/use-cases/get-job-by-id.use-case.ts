import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { JobRepository } from "../../../domain/repositories/job.repository.js";
import { JobOutputDto } from "../dtos/job-output.dto.js";

export class GetJobByIdUseCase {
  constructor(private readonly jobRepository: JobRepository) {}
  async execute(jobId: string): Promise<JobOutputDto> {
    const job = await this.jobRepository.getById(jobId);
    if (!job) {
      throw new NotFoundError("Job was not found.");
    }
    return job;
  }
}

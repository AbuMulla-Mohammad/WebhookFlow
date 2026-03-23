import { JobRepository } from "../../../domain/repositories/job.repository.js";
import { JobOutputDto } from "../dtos/job-output.dto.js";

export class GetAllJobsUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(limit?: number, offset?: number): Promise<JobOutputDto[] | []> {
    const jobs = await this.jobRepository.getAllJobs(limit, offset);
    return jobs;
  }
}

import { JobRepository } from "src/domain/repositories/job-repository";
import { JobOutputDto } from "../dtos/job-output.dto";

export class GetAllJobsUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(limit?: number, offset?: number): Promise<JobOutputDto[] | []> {
    const jobs = await this.jobRepository.getAllJobs(limit, offset);
    return jobs;
  }
}

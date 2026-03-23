import { RequestingUser } from "../../../application/types/requesting-user.js";
import { JobRepository } from "../../../domain/repositories/job.repository.js";
import { JobOutputDto } from "../dtos/job-output.dto.js";

export class GetAllJobsUseCase {
  constructor(private readonly jobRepository: JobRepository) {}
  async execute(
    requestingUser: RequestingUser,
    limit?: number,
    offset?: number,
  ): Promise<JobOutputDto[] | []> {
    if (requestingUser.role === "admin") {
      return this.jobRepository.getAllJobs(limit, offset);
    }

    return this.jobRepository.getAllByTriggeredBy(
      requestingUser!.id,
      limit,
      offset,
    );
  }
}

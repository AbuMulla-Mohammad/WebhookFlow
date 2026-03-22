import { z } from "zod";

export const jobIdParamsSchema = z.object({
  jobId: z.string().uuid("jobId must be a valid UUID"),
});

export const jobStatusParamsSchema = z.object({
  jobStatus: z.enum(["pending", "processing", "completed", "failed"], {
    message: "status must be a valid job status",
  }),
});

export type JobIdParams = z.infer<typeof jobIdParamsSchema>;
export type JobStatusParams = z.infer<typeof jobStatusParamsSchema>;

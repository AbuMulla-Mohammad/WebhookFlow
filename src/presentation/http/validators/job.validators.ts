import { z } from "zod";

export const jobIdParamsSchema = z.object({
  jobId: z.string().uuid("jobId must be a valid UUID"),
});

export const paginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 20))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "limit must be a positive integer",
    }),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 0))
    .refine((val) => Number.isInteger(val) && val >= 0, {
      message: "offset must be a non-negative integer",
    }),
});

export const jobStatusParamsSchema = z.object({
  jobStatus: z.enum(["pending", "processing", "completed", "failed"], {
    message: "status must be a valid job status",
  }),
});

export type JobIdParams = z.infer<typeof jobIdParamsSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type JobStatusParams = z.infer<typeof jobStatusParamsSchema>;

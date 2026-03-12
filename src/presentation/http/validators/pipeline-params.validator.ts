import { z } from "zod";

export const pipelineIdParamsSchema = z.object({
  pipelineId: z.string().uuid("pipelineId must be a valid UUID"),
});

export type PipelineIdParams = z.infer<typeof pipelineIdParamsSchema>;

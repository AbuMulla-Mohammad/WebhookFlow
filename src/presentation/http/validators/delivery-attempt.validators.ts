import { z } from "zod";

export const attemptIdParamsSchema = z.object({
  attemptId: z.string().uuid({ message: "attemptId must be a valid UUID" }),
});

export type AttemptIdParams = z.infer<typeof attemptIdParamsSchema>;

import { z } from "zod";

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

export type PaginationQuery = z.infer<typeof paginationSchema>;

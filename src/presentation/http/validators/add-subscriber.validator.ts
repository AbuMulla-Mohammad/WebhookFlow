import { z } from "zod";

export const addSubscriberSchema = z.object({
  targetUrl: z.string().trim().url("targetUrl must be a valid URL"),
});

export type AddSubscriberBody = z.infer<typeof addSubscriberSchema>;

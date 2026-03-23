import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email("email must be a valid email address"),
  password: z
    .string()
    .min(8, "password must be at least 8 characters")
    .max(72, "password must be at most 72 characters"),
  role: z.enum(["admin", "user"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("email must be a valid email address"),
  password: z.string().min(1, "password is required"),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;

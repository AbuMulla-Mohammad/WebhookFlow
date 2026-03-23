import { Request, Response, NextFunction } from "express";
import { RateLimiter } from "../../../shared/utils/rate-limiter.js";

const limiter = new RateLimiter({ windowMs: 60_000, max: 100 });

export function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const key = req.ip ?? "";
  if (limiter.isAllowed(key)) {
    next();
  } else {
    res
      .status(429)
      .json({ message: "Too many requests, please try again later." });
  }
}

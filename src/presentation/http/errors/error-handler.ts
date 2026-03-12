import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { ZodError } from "zod";
import { fail } from "../contracts/api-result.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json(
      fail(
        "Validation failed",
        err.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      ),
    );
  }

  if (err instanceof BadRequestError) {
    return res.status(400).json(fail(err.message));
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json(fail(err.message));
  }

  console.error(err);
  return res.status(500).json(fail("Internal server error"));
}

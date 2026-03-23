import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req.query) as Record<string, unknown>;
    req.query.limit = parsed.limit as string | undefined;
    req.query.offset = parsed.offset as string | undefined;
    next();
  };
}

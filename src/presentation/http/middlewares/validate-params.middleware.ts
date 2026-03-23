import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ZodType } from "zod";

export function validateParams<TParams extends ParamsDictionary>(
  schema: ZodType<TParams>,
) {
  return (req: Request<TParams>, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req.params);
    req.params = parsed;
    next();
  };
}

import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError("No authenticated user found."));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Role '${req.user.role}' is not allowed to access this resource.`,
        ),
      );
    }

    next();
  };
}

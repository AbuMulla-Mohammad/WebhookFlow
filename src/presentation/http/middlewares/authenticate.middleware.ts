import { NextFunction, Request, Response } from "express";
import { JwtTokenAdapter } from "../../../infrastructure/auth/jwt-token.adapter.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

const tokenAdapter = new JwtTokenAdapter();
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new UnauthorizedError("Missing or malformed Authorization header."),
    );
  }

  const token = authHeader.slice(7);

  try {
    const payload = tokenAdapter.verify(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    next(err);
  }
}

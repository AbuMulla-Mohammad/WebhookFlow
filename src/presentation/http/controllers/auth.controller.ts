import { NextFunction, Request, Response } from "express";
import { RegisterUseCase } from "../../../application/auth/use-cases/register.use-case.js";
import { LoginUseCase } from "../../../application/auth/use-cases/loging.use-case.js";
import { ok } from "../contracts/api-result.js";
import { LoginBody, RegisterBody } from "../validators/auth.validators.js";

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: RegisterBody = req.body;
      const result = await this.registerUseCase.execute(body);
      return res.status(201).json(ok(result, "Registration successful"));
    } catch (error) {
      return next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: LoginBody = req.body;
      const result = await this.loginUseCase.execute(body);
      return res.status(200).json(ok(result, "Login successful"));
    } catch (error) {
      return next(error);
    }
  };
}

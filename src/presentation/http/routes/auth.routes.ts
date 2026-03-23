import { Router } from "express";
import { AppContainer } from "../../composition-root/container.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validators/auth.validators.js";

export function buildAuthRoutes(container: AppContainer): Router {
  const router = Router();

  router.post(
    "/register",
    validateBody(registerSchema),
    container.controllers.Auth.register,
  );

  router.post(
    "/login",
    validateBody(loginSchema),
    container.controllers.Auth.login,
  );

  return router;
}

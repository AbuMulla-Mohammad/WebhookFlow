import jwt from "jsonwebtoken";
import { TokenPayload, TokenPort } from "../../application/ports/token.port.js";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError.js";
import { jwtConfig } from "../../shared/config/jwt.config.js";

export class JwtTokenAdapter implements TokenPort {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = jwtConfig.secret;
    this.expiresIn = jwtConfig.expiresIn;
  }

  sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    } as jwt.SignOptions);
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as jwt.JwtPayload;
      return { sub: decoded.sub as string, role: decoded.role as string };
    } catch {
      throw new UnauthorizedError("Invalid or expired token.");
    }
  }
}

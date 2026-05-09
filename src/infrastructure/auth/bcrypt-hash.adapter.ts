import bcrypt from "bcryptjs";
import { HashPort } from "../../application/ports/hash.port.js";

export class BcryptHashAdapter implements HashPort {
  private readonly saltRounds = 10;

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

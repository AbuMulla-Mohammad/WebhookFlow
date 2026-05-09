import { randomUUID } from "node:crypto";
import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { HashPort } from "../../ports/hash.port.js";
import { TokenPort } from "../../ports/token.port.js";
import { UserRepository } from "../../../domain/repositories/user.repository.js";
import { RegisterOutputDto } from "../dtos/register-output.dto.js";
import { RegisterInputDto } from "../dtos/register-input.dto.js";

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashPort: HashPort,
    private readonly tokenPort: TokenPort,
  ) {}

  async execute(input: RegisterInputDto): Promise<RegisterOutputDto> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new BadRequestError("Email is already registered.");
    }

    const passwordHash = await this.hashPort.hash(input.password);
    const now = new Date();

    const user = await this.userRepository.save({
      id: randomUUID(),
      email: input.email,
      passwordHash,
      role: input.role ?? "user",
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    });

    const token = this.tokenPort.sign({ sub: user.id, role: user.role });

    return { id: user.id, email: user.email, token };
  }
}

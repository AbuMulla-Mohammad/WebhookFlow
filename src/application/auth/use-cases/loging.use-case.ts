import { UserRepository } from "../../../domain/repositories/user.repository.js";
import { HashPort } from "../ports/hash.port.js";
import { TokenPort } from "../ports/token.port.js";
import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { LoginInputDto } from "../dtos/login-input.dto.js";
import { LoginOutputDto } from "../dtos/login-output.dto.js";

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashPort: HashPort,
    private readonly tokenPort: TokenPort,
  ) {}
  async execute(input: LoginInputDto): Promise<LoginOutputDto> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new BadRequestError("Invalid email or password.");
    }

    const passwordMatch = await this.hashPort.compare(
      input.password,
      user.passwordHash,
    );
    if (!passwordMatch) {
      throw new BadRequestError("Invalid email or password.");
    }

    const token = this.tokenPort.sign({ sub: user.id, role: user.role });

    return { id: user.id, email: user.email, token };
  }
}

import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { DeliveryAttemptRepository } from "../../../domain/repositories/delivery-attempt-repository.js";
import { DeliveryAttemptOutputDto } from "../dtos/delivery-attempt-output.dto.js";

export class GetDeliveryAttemptByIdUseCase {
  constructor(
    private readonly deliveryAttemptRepository: DeliveryAttemptRepository,
  ) {}

  async execute(attemptId: string): Promise<DeliveryAttemptOutputDto> {
    const attempt = await this.deliveryAttemptRepository.getById(attemptId);
    if (!attempt) {
      throw new NotFoundError("Delivery attempt was not found.");
    }
    return { ...attempt };
  }
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreatePipelineUseCase } from "../../../../application/pipeline/use-cases/create-pipeline.use-case.js";
import { PipelineRepository } from "../../../../domain/repositories/pipeline.repository.js";
import { SubscriberRepository } from "../../../../domain/repositories/subscriber.repository.js";
import { BadRequestError } from "../../../../shared/errors/BadRequestError.js";
import { Pipeline } from "../../../../domain/entities/pipeline.js";

const makePipelineRepo = (): PipelineRepository => ({
  getById: vi.fn(),
  getByIdWithSubscribers: vi.fn(),
  getByWebhookPath: vi.fn(),
  getByWebhookPathWithSubscribers: vi.fn(),
  getAll: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
});

const makeSubscriberRepo = (): SubscriberRepository => ({
  getById: vi.fn(),
  getByPipelineId: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
  saveMany: vi.fn(),
});

const makeSavedPipeline = (overrides?: Partial<Pipeline>): Pipeline => ({
  id: "pipeline-uuid",
  name: "My Pipeline",
  description: "A test pipeline",
  webhookPath: "my-pipeline",
  actionType: "transform-json",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  isDeleted: false,
  ...overrides,
});

const makeValidInput = () => ({
  name: "My Pipeline",
  description: "A test pipeline",
  webhookPath: "my-pipeline",
  actionType: "transform-json" as const,
  subscribers: ["https://example.com/hook"],
});

describe("CreatePipelineUseCase", () => {
  let pipelineRepo: PipelineRepository;
  let subscriberRepo: SubscriberRepository;
  let useCase: CreatePipelineUseCase;

  beforeEach(() => {
    pipelineRepo = makePipelineRepo();
    subscriberRepo = makeSubscriberRepo();
    useCase = new CreatePipelineUseCase(pipelineRepo, subscriberRepo);
  });

  it("creates a pipeline and saves its subscribers", async () => {
    vi.mocked(pipelineRepo.getByWebhookPath).mockResolvedValue(null);
    vi.mocked(pipelineRepo.save).mockResolvedValue(makeSavedPipeline());

    const result = await useCase.execute(makeValidInput());

    expect(pipelineRepo.save).toHaveBeenCalledOnce();
    expect(subscriberRepo.saveMany).toHaveBeenCalledOnce();
    expect(result.id).toBe("pipeline-uuid");
    expect(result.webhookPath).toBe("my-pipeline");
  });

  it("returns the correct output shape", async () => {
    vi.mocked(pipelineRepo.getByWebhookPath).mockResolvedValue(null);
    vi.mocked(pipelineRepo.save).mockResolvedValue(makeSavedPipeline());

    const result = await useCase.execute(makeValidInput());

    expect(result).toMatchObject({
      id: expect.any(String),
      name: "My Pipeline",
      webhookPath: "my-pipeline",
      createdAt: expect.any(Date),
    });
  });

  it("saves subscribers with the correct pipelineId and targetUrls", async () => {
    const input = {
      ...makeValidInput(),
      subscribers: ["https://a.com/hook", "https://b.com/hook"],
    };
    vi.mocked(pipelineRepo.getByWebhookPath).mockResolvedValue(null);
    vi.mocked(pipelineRepo.save).mockResolvedValue(makeSavedPipeline());

    await useCase.execute(input);

    const saved = vi.mocked(subscriberRepo.saveMany).mock.calls[0][0];
    expect(saved).toHaveLength(2);
    expect(saved[0].targetUrl).toBe("https://a.com/hook");
    expect(saved[1].targetUrl).toBe("https://b.com/hook");
    expect(saved[0].pipelineId).toBe("pipeline-uuid");
    expect(saved[1].pipelineId).toBe("pipeline-uuid");
  });

  it("creates pipeline with zero subscribers when subscribers array is empty", async () => {
    const input = { ...makeValidInput(), subscribers: [] };
    vi.mocked(pipelineRepo.getByWebhookPath).mockResolvedValue(null);
    vi.mocked(pipelineRepo.save).mockResolvedValue(makeSavedPipeline());

    await useCase.execute(input);

    const saved = vi.mocked(subscriberRepo.saveMany).mock.calls[0][0];
    expect(saved).toHaveLength(0);
  });

  it("throws BadRequestError when action type is invalid", async () => {
    const input = {
      ...makeValidInput(),
      actionType: "not-a-real-action" as never,
    };

    await expect(useCase.execute(input)).rejects.toThrow(BadRequestError);
    await expect(useCase.execute(input)).rejects.toThrow(
      "Invalid action type: not-a-real-action",
    );
  });

  it("throws BadRequestError when webhook path is already taken", async () => {
    vi.mocked(pipelineRepo.getByWebhookPath).mockResolvedValue(
      makeSavedPipeline(),
    );

    await expect(useCase.execute(makeValidInput())).rejects.toThrow(
      BadRequestError,
    );
    await expect(useCase.execute(makeValidInput())).rejects.toThrow(
      "Webhook path already exists",
    );
  });

  it("does not save anything when webhook path is already taken", async () => {
    vi.mocked(pipelineRepo.getByWebhookPath).mockResolvedValue(
      makeSavedPipeline(),
    );

    await expect(useCase.execute(makeValidInput())).rejects.toThrow();

    expect(pipelineRepo.save).not.toHaveBeenCalled();
    expect(subscriberRepo.saveMany).not.toHaveBeenCalled();
  });

  it("does not call getByWebhookPath when action type is invalid", async () => {
    const input = {
      ...makeValidInput(),
      actionType: "bad-type" as never,
    };

    await expect(useCase.execute(input)).rejects.toThrow();

    expect(pipelineRepo.getByWebhookPath).not.toHaveBeenCalled();
  });
});

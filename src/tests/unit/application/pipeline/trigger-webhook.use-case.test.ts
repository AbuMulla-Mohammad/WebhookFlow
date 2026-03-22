import { describe, it, expect, vi, beforeEach } from "vitest";
import { TriggerWebhookUseCase } from "../../../../application/pipeline/use-cases/trigger-webhook.use-case.js";
import { PipelineRepository } from "../../../../domain/repositories/pipeline-repository.js";
import { JobRepository } from "../../../../domain/repositories/job-repository.js";
import { JobQueuePublisher } from "../../../../infrastructure/messaging/rabbitmq-job-queue.publisher.js";
import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
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

const makeJobRepo = (): JobRepository => ({
  getAllJobs: vi.fn(),
  getById: vi.fn(),
  save: vi.fn(),
  getByStatus: vi.fn(),
  updateStatus: vi.fn(),
  markProcessing: vi.fn(),
  markCompleted: vi.fn(),
  markFailed: vi.fn(),
});

const makeJobQueuePublisher = (): JobQueuePublisher => ({
  publishProcessJob: vi.fn(),
});

const makePipeline = (): Pipeline => ({
  id: "pipeline-uuid",
  name: "My Pipeline",
  description: "desc",
  webhookPath: "my-path",
  actionType: "transform-json",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  isDeleted: false,
});

describe("TriggerWebhookUseCase", () => {
  let pipelineRepo: PipelineRepository;
  let jobRepo: JobRepository;
  let jobQueuePublisher: JobQueuePublisher;
  let useCase: TriggerWebhookUseCase;

  beforeEach(() => {
    pipelineRepo = makePipelineRepo();
    jobRepo = makeJobRepo();
    jobQueuePublisher = makeJobQueuePublisher();
    useCase = new TriggerWebhookUseCase(
      pipelineRepo,
      jobRepo,
      jobQueuePublisher,
    );
  });

  it("saves a job and publishes it to the queue", async () => {
    vi.mocked(pipelineRepo.getByWebhookPath).mockResolvedValue(makePipeline());

    await useCase.execute("my-path", { event: "test" });

    expect(jobRepo.save).toHaveBeenCalledOnce();
    expect(jobQueuePublisher.publishProcessJob).toHaveBeenCalledOnce();
  });

  it("returns the correct output shape with pending status", async () => {
    vi.mocked(pipelineRepo.getByWebhookPath).mockResolvedValue(makePipeline());

    const result = await useCase.execute("my-path", { event: "test" });

    expect(result).toMatchObject({
      jobId: expect.any(String),
      pipelineId: "pipeline-uuid",
      status: "pending",
      acceptedAt: expect.any(Date),
    });
  });

  it("saves the job with the correct pipelineId and payload", async () => {
    vi.mocked(pipelineRepo.getByWebhookPath).mockResolvedValue(makePipeline());
    const payload = { event: "order.placed", orderId: "123" };

    await useCase.execute("my-path", payload);

    const savedJob = vi.mocked(jobRepo.save).mock.calls[0][0];
    expect(savedJob.pipelineId).toBe("pipeline-uuid");
    expect(savedJob.payload).toEqual(payload);
    expect(savedJob.status).toBe("pending");
    expect(savedJob.attempts).toBe(0);
  });

  it("publishes the same jobId that was saved", async () => {
    vi.mocked(pipelineRepo.getByWebhookPath).mockResolvedValue(makePipeline());

    await useCase.execute("my-path", {});

    const savedJobId = vi.mocked(jobRepo.save).mock.calls[0][0].id;
    const publishedJobId = vi.mocked(jobQueuePublisher.publishProcessJob).mock
      .calls[0][0];

    expect(publishedJobId).toBe(savedJobId);
  });

  it("throws NotFoundError when no pipeline matches the webhook path", async () => {
    vi.mocked(pipelineRepo.getByWebhookPath).mockResolvedValue(null);

    await expect(
      useCase.execute("ghost-path", { event: "test" }),
    ).rejects.toThrow(NotFoundError);
    await expect(
      useCase.execute("ghost-path", { event: "test" }),
    ).rejects.toThrow("Workflow was not found.");
  });

  it("does not save a job or publish when pipeline is not found", async () => {
    vi.mocked(pipelineRepo.getByWebhookPath).mockResolvedValue(null);

    await expect(useCase.execute("ghost-path", {})).rejects.toThrow();

    expect(jobRepo.save).not.toHaveBeenCalled();
    expect(jobQueuePublisher.publishProcessJob).not.toHaveBeenCalled();
  });
});

# WebhookFlow

A webhook-driven task processing pipeline built with TypeScript, PostgreSQL, RabbitMQ, and Docker. Incoming webhooks are asynchronously queued, processed through configurable actions, and results are delivered to registered subscriber URLs with exponential-backoff retry logic.

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Design Decisions](#design-decisions)
- [Processing Actions](#processing-actions)
- [Reliability & Error Handling](#reliability--error-handling)
- [Authentication & Authorization](#authentication--authorization)
- [Rate Limiting](#rate-limiting)
- [CI/CD](#cicd)
- [Running Tests](#running-tests)

---

## Overview

WebhookFlow lets users create **pipelines**. Each pipeline connects:

1. **A source** — a unique webhook URL that accepts incoming HTTP POST requests
2. **A processing action** — a transformation applied to the incoming payload
3. **Subscribers** — one or more destination URLs that receive the processed result

When a webhook fires, the service enqueues a job and returns immediately (HTTP 202). A background worker picks up the job, processes it, and delivers results to all subscribers. Failed deliveries are retried with exponential backoff. Exhausted jobs are routed to a Dead Letter Queue (DLQ) for inspection.

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/)
- A [Cohere API key](https://cohere.com/) (only needed for the `summarize-youtube-video` action, it should be injected on the docker compose file )

### 1. Clone the repository

```bash
git clone https://github.com/your-username/WebhookFlow.git
cd WebhookFlow
```

### 2. Create a `.env` file

```bash
cp .env.example .env
```

Fill in the required values (see [Environment Variables](#environment-variables) below).

### 3. Build and start all services

```bash
docker compose up --build
```

This starts:

| Container                | Purpose                         | Port         |
| ------------------------ | ------------------------------- | ------------ |
| `webhookflow-app`        | HTTP API server                 | 3000         |
| `webhookflow-worker`     | Background job processor        | —            |
| `webhookflow-postgres`   | PostgreSQL database             | 5432         |
| `webhookflow-rabbitmq`   | Message broker + management UI  | 5672 / 15672 |
| `webhookflow-samuraizer` | YouTube summarizer microservice | 8000         |

The API will be available at `http://localhost:3000`.  
The RabbitMQ management UI is available at `http://localhost:15672` (guest / guest).

### 4. Health check

```bash
curl http://localhost:3000/health
```

---

## Environment Variables

| Variable                       | Description                          | Default                                                                  |
| ------------------------------ | ------------------------------------ | ------------------------------------------------------------------------ |
| `DATABASE_URL`                 | PostgreSQL connection string         | `postgres://postgres:postgres@postgres:5432/webhookflow?sslmode=disable` |
| `JWT_SECRET`                   | Secret key for signing JWT tokens    | `a-string-secret-at-least-256-bits-long`                                 |
| `JWT_EXPIRES_IN`               | JWT expiration (e.g. `7d`)           | `7d`                                                                     |
| `RABBITMQ_URL`                 | RabbitMQ AMQP connection string      | `amqp://rabbitmq:5672`                                                   |
| `RABBITMQ_MAX_PROCESS_RETRIES` | Max retry attempts before DLQ        | `3`                                                                      |
| `SAMURAIZER_BASE_URL`          | Base URL of the Samuraizer service   | `http://samuraizer:8000`                                                 |
| `DELIVERY_MAX_ATTEMPTS`        | Max delivery attempts per subscriber | `3`                                                                      |
| `DELIVERY_RETRY_BASE_DELAY_MS` | Base delay (ms) for delivery backoff | `1000`                                                                   |

Example `.env`:

```env
DATABASE_URL=postgres://postgres:postgres@postgres:5432/webhookflow?sslmode=disable
RABBITMQ_URL=amqp://rabbitmq:5672
RABBITMQ_PROCESS_QUEUE=jobs.process
RABBITMQ_PREFETCH=5
RABBITMQ_PROCESS_RETRY_QUEUE=jobs.process.retry
RABBITMQ_PROCESS_DLQ=jobs.process.dlq
RABBITMQ_MAX_PROCESS_RETRIES=3
RABBITMQ_PROCESS_RETRY_DELAY_MS=5000
SAMURAIZER_BASE_URL=http://samuraizer:8000
SAMURAIZER_SUMMARY_TRANSCRIPT_PATH=/api/summarize_format_transcript
SAMURAIZER_TIMEOUT_MS=300000
JWT_SECRET=a-string-secret-at-least-256-bits-long
JWT_EXPIRES_IN=7d
COHERE_API_KEY=COHER_API_KEY
```

---

### Base URL

```
http://localhost:3000/api
```

### Authentication

All endpoints except `POST /auth/register` and `POST /auth/login` require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## API Documentation

> 📄 **Full Postman API Documentation (WebhookFlow):** [WebhookFlow API](https://documenter.getpostman.com/view/37800136/2sBXijKXG3)

> 📄 **Samuraizer Postman API Documentation:** [YouTube Summarizer API](https://documenter.getpostman.com/view/37800136/2sB3Wk14it)

**Base URL:** `http://localhost:3000/api`

All endpoints except `POST /auth/register` and `POST /auth/login` require a JWT Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

### Auth

| Method | Endpoint         | Auth | Description                                       |
| ------ | ---------------- | ---- | ------------------------------------------------- |
| `POST` | `/auth/register` | ❌   | Register a new user (`email`, `password`, `role`) |
| `POST` | `/auth/login`    | ❌   | Login — returns a signed JWT token                |

### Pipelines

| Method   | Endpoint                                           | Auth | Role  | Description                                                                     |
| -------- | -------------------------------------------------- | ---- | ----- | ------------------------------------------------------------------------------- |
| `GET`    | `/pipelines`                                       | ✅   | any   | List all pipelines — supports `page` & `limit` query params                     |
| `POST`   | `/pipelines`                                       | ✅   | admin | Create a pipeline — requires `name`, `description`, `webhookPath`, `actionType` |
| `GET`    | `/pipelines/:pipelineId`                           | ✅   | any   | Get a single pipeline by ID                                                     |
| `PUT`    | `/pipelines/:pipelineId`                           | ✅   | admin | Update a pipeline's `name`, `description`, or `actionType`                      |
| `GET`    | `/pipelines/webhook/:webhookPath`                  | ✅   | any   | Look up a pipeline by its webhook path                                          |
| `POST`   | `/pipelines/:pipelineId/subscribers`               | ✅   | admin | Add a subscriber URL to a pipeline                                              |
| `DELETE` | `/pipelines/:pipelineId/subscribers/:subscriberId` | ✅   | admin | Remove a subscriber from a pipeline                                             |

### Webhooks

| Method | Endpoint                 | Auth | Description                                                          |
| ------ | ------------------------ | ---- | -------------------------------------------------------------------- |
| `POST` | `/webhooks/:webhookPath` | ✅   | Fire a pipeline — accepted immediately (HTTP 202), job queued async. |

> For `summarize-youtube-video` pipelines, the body must include `{ "videoUrl": "..." }`.

### Jobs

| Method | Endpoint                         | Auth | Role  | Description                                                            |
| ------ | -------------------------------- | ---- | ----- | ---------------------------------------------------------------------- |
| `GET`  | `/jobs`                          | ✅   | admin | List all jobs — supports `page` & `limit` query params                 |
| `GET`  | `/jobs/:jobId`                   | ✅   | any   | Get job by ID — includes `status`, `payload`, `result`, `errorMessage` |
| `GET`  | `/jobs/status/:jobStatus`        | ✅   | any   | Filter jobs by status (`pending`, `processing`, `completed`, `failed`) |
| `GET`  | `/jobs/:jobId/delivery-attempts` | ✅   | any   | List all delivery attempts for a job                                   |

### Delivery Attempts

| Method | Endpoint                        | Auth | Description                                                                                              |
| ------ | ------------------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| `GET`  | `/delivery-attempts/:attemptId` | ✅   | Get a single delivery attempt by ID — includes `status`, `responseCode`, `attemptNumber`, `errorMessage` |

### Health

| Method | Endpoint  | Auth | Description          |
| ------ | --------- | ---- | -------------------- |
| `GET`  | `/health` | ❌   | Service health check |

---

## Architecture

WebhookFlow follows **Clean Architecture** (also known as Hexagonal Architecture), with strict separation between domain logic, application use cases, infrastructure adapters, and the HTTP presentation layer.

```
src/
├── domain/              # Entities, repository interfaces, domain types
├── application/         # Use cases, DTOs, port interfaces
├── infrastructure/      # Database, messaging, HTTP clients (adapters)
├── presentation/        # Express HTTP controllers, routes, middlewares
│   └── composition-root/ # Dependency injection / wiring
├── worker/              # Background job consumer (separate process)
└── shared/              # Config, errors, validators, utilities
```

### Request Lifecycle

```
POST /api/webhooks/:path
        │
        ▼
  Authenticate (JWT)
        │
        ▼
  TriggerWebhookUseCase
   - Find pipeline by path
   - Create Job (status: pending)
   - Publish jobId to RabbitMQ
        │
        ▼
  HTTP 202 → { jobId }
        │
        ▼ (async)
  Worker consumes message
        │
        ▼
  ProcessJobUseCase
   - Mark job as processing
   - Run pipeline action
   - Mark job as completed (or failed)
        │
        ▼
  DeliverJobUseCase
   - POST result to each subscriber
   - Exponential backoff on failure
   - Record each DeliveryAttempt
        │
        ▼
  Success → ACK message
  Failure → Retry queue → DLQ after max retries
```

### Database Schema

Five tables, all with `id` (UUID), `created_at`, `updated_at`, and soft-delete via `is_deleted`:

- **users** — `email`, `password_hash`, `role`
- **pipelines** — `name`, `description`, `webhook_path` (unique), `action_type`
- **subscribers** — `pipeline_id` (FK), `target_url`
- **jobs** — `pipeline_id` (FK), `payload` (jsonb), `result` (jsonb), `status`, `error_message`, `processed_at`, `attempts`, `triggeredBy` (FK)
- **delivery_attempts** — `job_id` (FK), `subscriber_id` (FK), `status`, `response_code`, `attempt_number`, `error_message`

Database migrations are managed with [Drizzle ORM](https://orm.drizzle.team/).

### Messaging

RabbitMQ is used as the message broker with three queues:

| Queue        | Purpose                                                           |
| ------------ | ----------------------------------------------------------------- |
| `jobs`       | Main processing queue                                             |
| `jobs.retry` | Messages scheduled for retry (with TTL → re-routed to main queue) |
| `jobs.dlq`   | Dead Letter Queue for exhausted or malformed messages             |

---

## Design Decisions

**Why Clean Architecture?**  
Separating domain logic from infrastructure means the core business rules (what a pipeline does, what a job is) have zero dependencies on Express, PostgreSQL, or RabbitMQ. This makes each layer independently testable and swappable — for example, the `SamuraizerPort` interface lets the application layer call the YouTube summarizer without knowing anything about HTTP.

**Why RabbitMQ instead of a database queue?**  
 RabbitMQ handles retries and dead-letter messages automatically and keeps the API separate from background workers.

**Why a separate worker process?**  
 Heavy tasks (like fetching transcripts) run in a separate container, so the API stays fast and responsive.

---

## Processing Actions

### `transform-json`

Prefixes every top-level key in the incoming payload with `x_`.

**Input:**

```json
{ "name": "Alice", "score": 42 }
```

**Output:**

```json
{
  "action": "transform-json",
  "transformed": { "x_name": "Alice", "x_score": 42 },
  "transformedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### `extract-payload-keys`

Extracts and sorts all top-level keys from the incoming payload.

**Input:**

```json
{ "z": 1, "a": 2, "m": 3 }
```

**Output:**

```json
{
  "action": "extract-payload-keys",
  "topLevelKeys": ["a", "m", "z"],
  "topLevelCount": 3,
  "extractedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### `summarize-youtube-video`

Sends a YouTube video URL to an external Python service and receives a structured AI summary along with formatted transcript sections via the Samuraizer microservice (powered by Cohere). The payload must include a `videoUrl` field.

**Input:**

```json
{ "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
```

**Output:**

```json
{
  "action": "summarize-youtube-video",
  "videoUrl": "https://youtu.be/NQ3fZtyXji0?si=5vHPsl3Ze1wxNz-M",
  "summary": [
    {
      "start": 0.08,
      "end": 77.92,
      "title": "🐰 RabbitMQ Basics: The Cloud Post Office",
      "summary": "RabbitMQ is like a post office in the cloud, helping different parts of apps talk to each other. It’s an open-source message broker built in 2007 using Erlang, a language known for powering telecom systems. Think of it as the middleman that lets servers send and receive data asynchronously, making it perfect for microservices."
    },
    {
      "start": 35.6,
      "end": 69.52,
      "title": "🚀 How RabbitMQ Works: Exchanges & Queues",
      "summary": "Messages in RabbitMQ are routed through exchanges to queues. Exchanges act like traffic cops, sending messages to specific queues based on rules (like topics or fanout). Queues hold messages until consumers (like an image processing server) grab them. This setup ensures smooth, scalable communication between services."
    }
  ],
  "transcript": [
    {
      "start": 0.08,
      "end": 14.72,
      "text": "RabbitMQ is an open-source distributed message broker that works like a post office in the cloud. It was developed in 2007 and written in the Erlang programming language, which is famous for powering the open telecom platform."
    },
    {
      "start": 14.72,
      "end": 30.48,
      "text": "In the beginning, apps were built as monoliths with all concerns coupled together on a single runtime. The problem is that not everything scales in parallel. Differing computational needs gave rise to the microservice architecture, where every concern has its own runtime that scales independently."
    }
  ],
  "summarizedAt": "2026-03-24T13:42:05.381Z"
}
```

---

## Reliability & Error Handling

### Job-level retries (worker)

When a job fails to process or not all subscribers receive the result, the worker re-queues the message with an incremented `x-retry-count` header. Retries use a delay queue (TTL-based) so messages wait before being re-processed. After `RABBITMQ_MAX_PROCESS_RETRIES` exhausted attempts, the message is published to the DLQ and the job is marked `failed`.

### Delivery-level retries (per subscriber)

For each subscriber, delivery is attempted up to `DELIVERY_MAX_ATTEMPTS` times. Each subsequent attempt waits `baseDelay * 2^(attempt - 1)` ms (exponential backoff). Every attempt — success or failure — is recorded in the `delivery_attempts` table with the HTTP response code and any error message.

### Delivery timeout

Each outbound POST to a subscriber has a 5-second `AbortController` timeout to prevent a slow subscriber from blocking delivery to others.

### Idempotent processing

Before processing, the worker checks that the job is in `pending` status. If the job has already been picked up by another worker instance (`processing`, `completed`, or `failed`), the message is acknowledged and discarded without reprocessing.

### Error types

| Error                 | HTTP Status |
| --------------------- | ----------- |
| Validation error      | 400         |
| Unauthenticated       | 401         |
| Forbidden             | 403         |
| Resource not found    | 404         |
| Rate limit exceeded   | 429         |
| Internal server error | 500         |

---

## Authentication & Authorization

WebhookFlow uses **JWT-based authentication**. Every request to protected endpoints must include:

```
Authorization: Bearer <token>
```

There are two roles:

| Role    | Capabilities                                                        |
| ------- | ------------------------------------------------------------------- |
| `user`  | Trigger webhooks, read jobs, read delivery attempts, read pipelines |
| `admin` | Everything above + create/update pipelines, manage subscribers      |

Passwords are hashed with **bcrypt** before storage.

---

## Rate Limiting

A rate limiter is applied globally: **100 requests per minute per IP address**. Requests exceeding the limit receive HTTP `429 Too Many Requests`.

---

## CI

GitHub Actions runs on every push and pull request to `main`. The pipeline:

1. **Checks formatting** (`prettier`)
2. **Checks lint** (`eslint`, zero warnings allowed)
3. **Runs tests** (`vitest`)

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## CD

### Continuous Deployment (Docker)

The CD pipeline simulates a deployment by **building and running Docker images** for all services. It runs automatically on pushes to `main`.

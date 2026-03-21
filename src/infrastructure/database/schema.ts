import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  smallint,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const actionTypeEnum = pgEnum("action_type", [
  "summarize-youtube-video",
  "transform-json",
  "extract-payload-keys",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "retrying",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "success",
  "failed",
]);

export const pipelines = pgTable(
  "pipelines",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    webhookPath: text("webhook_path").notNull().unique(),
    actionType: actionTypeEnum("action_type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    isDeleted: boolean("is_deleted").notNull().default(false),
  },
  (table) => [index("webhook_path_idx").on(table.webhookPath)],
);

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey(),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .references(() => pipelines.id, { onDelete: "cascade" }),
  targetUrl: text("target_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    isDeleted: boolean("is_deleted").notNull().default(false),
    processedAt: timestamp("processed_at"),
    attempts: smallint("attempts").default(0).notNull(),
    result: jsonb("result"),
    pipelineId: uuid("pipeline_id")
      .notNull()
      .references(() => pipelines.id, { onDelete: "cascade" }),
    payload: jsonb("payload").notNull(),
    errorMessage: text("error_message"),
    status: jobStatusEnum("status").notNull(),
  },
  (table) => [
    index("jobs_status_idx").on(table.status),
    index("jobs_pipeline_id_idx").on(table.pipelineId),
    index("jobs_status_created_at_idx").on(table.status, table.createdAt),
  ],
);

export const deliveryAttempts = pgTable(
  "delivery_attempts",
  {
    id: uuid("id").primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    isDeleted: boolean("is_deleted").notNull().default(false),
    errorMessage: text("error_message"),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    subscriberId: uuid("subscriber_id")
      .notNull()
      .references(() => subscribers.id, { onDelete: "cascade" }),
    status: deliveryStatusEnum("status").notNull(),
    responseCode: smallint("response_code"),
    attemptNumber: smallint("attempt_number").notNull().default(1),
  },
  (table) => [
    index("delivery_attempts_job_id_idx").on(table.jobId),
    index("delivery_attempts_subscriber_id_idx").on(table.subscriberId),
    index("delivery_attempts_status_idx").on(table.status),
    uniqueIndex("delivery_attempts_job_subscriber_attempt_uidx").on(
      table.jobId,
      table.subscriberId,
      table.attemptNumber,
    ),
  ],
);

export type PipelineRow = typeof pipelines.$inferSelect;
export type SubscriberRow = typeof subscribers.$inferSelect;
export type JobRow = typeof jobs.$inferSelect;
export type DeliveryAttemptRow = typeof deliveryAttempts.$inferSelect;

CREATE TYPE "public"."action_type" AS ENUM('summarize-youtube-video', 'transform-json');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'retrying');--> statement-breakpoint
CREATE TABLE "delivery_attempts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"error_message" text,
	"job_id" uuid NOT NULL,
	"subscriber_id" uuid NOT NULL,
	"status" "delivery_status" NOT NULL,
	"response_code" smallint,
	"attempt_number" smallint DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"result" jsonb,
	"pipeline_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"error_message" text,
	"status" "job_status" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscribers" DROP CONSTRAINT "subscribers_pipeline_id_pipelines_id_fk";
--> statement-breakpoint
ALTER TABLE "pipelines" ALTER COLUMN "action_type" SET DATA TYPE "public"."action_type" USING "action_type"::"public"."action_type";--> statement-breakpoint
ALTER TABLE "delivery_attempts" ADD CONSTRAINT "delivery_attempts_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_attempts" ADD CONSTRAINT "delivery_attempts_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "delivery_attempts_job_id_idx" ON "delivery_attempts" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "delivery_attempts_subscriber_id_idx" ON "delivery_attempts" USING btree ("subscriber_id");--> statement-breakpoint
CREATE INDEX "delivery_attempts_status_idx" ON "delivery_attempts" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "delivery_attempts_job_subscriber_attempt_uidx" ON "delivery_attempts" USING btree ("job_id","subscriber_id","attempt_number");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jobs_pipeline_id_idx" ON "jobs" USING btree ("pipeline_id");--> statement-breakpoint
CREATE INDEX "jobs_status_created_at_idx" ON "jobs" USING btree ("status","created_at");--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "webhook_path_idx" ON "pipelines" USING btree ("webhook_path");
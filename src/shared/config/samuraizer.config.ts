process.loadEnvFile();

export const samuraizerConfig = {
  baseUrl: process.env.SAMURAIZER_BASE_URL ?? "http://localhost:8000",
  timeoutMs: Number(process.env.SAMURAIZER_TIMEOUT_MS ?? 150000),
  summaryAndTranscriptPath:
    process.env.SAMURAIZER_SUMMARY_TRANSCRIPT_PATH ??
    "/api/summarize_format_transcript",
};

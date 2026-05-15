import { ActionHandler } from "../../../application/ports/action-handler.port.js";
import { SamuraizerPort } from "../../../application/ports/samuraizer.port.js";

export class SummarizeYouTubeHandler implements ActionHandler {
  constructor(private readonly samuraizer: SamuraizerPort) {}
  readonly type = "summarize-youtube-video" as const;
  async execute(
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const videoUrl = payload.videoUrl;
    if (typeof videoUrl !== "string" || !videoUrl.trim()) {
      throw new Error(
        "Missing or invalid payload.videoUrl for summarize action",
      );
    }
    const summaryAndTranscript =
      await this.samuraizer.summarizeAndFormatTranscriptVideo(videoUrl);
    return {
      action: this.type,
      videoUrl,
      summary: summaryAndTranscript.summarySections,
      transcript: summaryAndTranscript.formattedTranscript ?? null,
      summarizedAt: new Date().toISOString(),
    };
  }
}

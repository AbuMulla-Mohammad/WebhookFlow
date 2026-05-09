import { SamuraizerSummaryTranscriptResponseDto } from "../../application/job/dtos/samuraizer-summary-response.dto.js";
import { SamuraizerPort } from "../../application/ports/samuraizer.port.js";
import { samuraizerConfig } from "../../shared/config/samuraizer.config.js";
import {
  mapSamuraizerResponse,
  SamuraizerApiResponse,
} from "./mappers/samuraizer.mapper.js";

export class SamuraizerHttpClient implements SamuraizerPort {
  async summarizeAndFormatTranscriptVideo(
    videoUrl: string,
  ): Promise<SamuraizerSummaryTranscriptResponseDto> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      samuraizerConfig.timeoutMs,
    );
    try {
      const res = await fetch(
        `${samuraizerConfig.baseUrl}${samuraizerConfig.summaryAndTranscriptPath}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            video_url: videoUrl,
            prompt_type: "friendly_summary_with_emojis_and_ideas_explenation",
            text_with_timestamp: "string",
            model: "command-a-03-2025",
          }),
          signal: controller.signal,
        },
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Samuraizer request failed: ${res.status} ${text}`);
      }

      const rawData = (await res.json()) as SamuraizerApiResponse;
      return mapSamuraizerResponse(rawData);
    } catch (error) {
      if (
        (error instanceof DOMException && error.name === "AbortError") ||
        (error instanceof Error && error.name === "AbortError") ||
        (error instanceof TypeError && error.message.includes("abort"))
      ) {
        throw new Error(
          `Samuraizer request timeout after ${samuraizerConfig.timeoutMs}ms`,
        );
      }
      console.log(error);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

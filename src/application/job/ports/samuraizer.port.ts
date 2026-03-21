import { SamuraizerSummaryTranscriptResponseDto } from "../dtos/samuraizer-summary-response.dto.js";

export interface SamuraizerPort {
  summarizeAndFormatTranscriptVideo(
    videoUrl: string,
  ): Promise<SamuraizerSummaryTranscriptResponseDto>;
}

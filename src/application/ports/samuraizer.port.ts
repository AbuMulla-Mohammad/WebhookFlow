import { SamuraizerSummaryTranscriptResponseDto } from "../job/dtos/samuraizer-summary-response.dto.js";

export interface SamuraizerPort {
  summarizeAndFormatTranscriptVideo(
    videoUrl: string,
  ): Promise<SamuraizerSummaryTranscriptResponseDto>;
}

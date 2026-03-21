import { SamuraizerSummaryTranscriptResponseDto } from "../../../application/job/dtos/samuraizer-summary-response.dto.js";

export interface SamuraizerApiResponse {
  summary_sections: Array<{
    title?: string | null;
    summary: string;
    start: number;
    end: number;
  }>;
  formatted_transcript: Array<{
    text: string;
    start: number;
    end: number;
  }>;
}

export function mapSamuraizerResponse(
  raw: SamuraizerApiResponse,
): SamuraizerSummaryTranscriptResponseDto {
  return {
    summarySections: raw.summary_sections.map((section) => ({
      title: section.title,
      summary: section.summary,
      start: section.start,
      end: section.end,
    })),
    formattedTranscript: raw.formatted_transcript.map((transcript) => ({
      text: transcript.text,
      start: transcript.start,
      end: transcript.end,
    })),
  };
}

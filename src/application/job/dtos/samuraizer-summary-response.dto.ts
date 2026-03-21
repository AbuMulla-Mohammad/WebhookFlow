export interface SummarySectionDto {
  title?: string | null;
  summary: string;
  start: number;
  end: number;
}

export interface FormattedTranscriptDto {
  text: string;
  start: number;
  end: number;
}

export interface SamuraizerSummaryTranscriptResponseDto {
  summarySections: SummarySectionDto[];
  formattedTranscript: FormattedTranscriptDto[];
}

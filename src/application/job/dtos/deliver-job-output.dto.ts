export interface DeliverJobOutputDto {
  jobId: string;
  totalSubscribers: number;
  successCount: number;
  failedCount: number;
  attempts: {
    subscriberId: string;
    status: "success" | "failed";
    responseCode?: number;
  }[];
}

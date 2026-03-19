type QueuePayload = {
  jobId?: string;
  createdAt?: string;
};

export function tryParsePayload(
  raw: string,
): { ok: true; value: QueuePayload } | { ok: false; reason: string } {
  try {
    return {
      ok: true,
      value: JSON.parse(raw) as QueuePayload,
    };
  } catch {
    return { ok: false, reason: "Invalid JSON message payload" };
  }
}

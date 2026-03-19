import { ConsumeMessage } from "amqplib";

export function getRetryCount(message: ConsumeMessage): number {
  const value = message.properties.headers?.["x-retry-count"];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

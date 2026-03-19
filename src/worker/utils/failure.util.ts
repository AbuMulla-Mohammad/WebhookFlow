export function isRetryableProcessFailure(reason: string): boolean {
  const normalized = reason.toLowerCase();

  if (normalized.includes("pipeline was not found")) {
    return false;
  }

  if (normalized.includes("unsupported action type")) {
    return false;
  }

  return true;
}

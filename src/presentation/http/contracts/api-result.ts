export type APIResult<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
  meta?: Record<string, unknown>;
};

export function ok<T>(
  data: T,
  message = "Success",
  meta?: Record<string, unknown>,
): APIResult<T> {
  return {
    success: true,
    message,
    data,
    errors: null,
    meta,
  };
}

export function fail(
  message: string,
  errors?: string[],
  meta?: Record<string, unknown>,
): APIResult<null> {
  return {
    success: false,
    message,
    data: null,
    errors: errors ?? null,
    meta,
  };
}

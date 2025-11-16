import type { QueryKey } from '@tanstack/react-query';

/**
 * Custom error class for hydration-related failures
 *
 * @remarks
 * This error is thrown when a query fails during server-side prefetching.
 * It includes the query key and original error for better debugging.
 *
 * @example
 * ```ts
 * try {
 *   await queryClient.prefetchQuery({ ... });
 * } catch (error) {
 *   throw new HydrationError(
 *     'Failed to prefetch user data',
 *     ['users', userId],
 *     error
 *   );
 * }
 * ```
 */
export class HydrationError extends Error {
  /**
   * The query key that failed to hydrate
   */
  public readonly queryKey: QueryKey;

  /**
   * The original error that caused the hydration failure
   */
  public readonly originalError: unknown;

  /**
   * Whether this error should be logged in development mode
   * @default true
   */
  public readonly shouldLog: boolean;

  constructor(
    message: string,
    queryKey: QueryKey,
    originalError: unknown,
    shouldLog = true
  ) {
    super(message);
    this.name = 'HydrationError';
    this.queryKey = queryKey;
    this.originalError = originalError;
    this.shouldLog = shouldLog;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HydrationError);
    }
  }

  /**
   * Returns a formatted string representation of the query key
   */
  getQueryKeyString(): string {
    return JSON.stringify(this.queryKey);
  }

  /**
   * Returns a developer-friendly error message with context
   */
  getDetailedMessage(): string {
    const keyStr = this.getQueryKeyString();
    const originalMsg =
      this.originalError instanceof Error
        ? this.originalError.message
        : String(this.originalError);

    return `${this.message}\nQuery Key: ${keyStr}\nOriginal Error: ${originalMsg}`;
  }
}

/**
 * Checks if an error is a HydrationError
 */
export function isHydrationError(error: unknown): error is HydrationError {
  return error instanceof HydrationError;
}

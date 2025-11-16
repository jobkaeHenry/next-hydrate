import type { FetchMode } from '../detectFetchMode.js';

export interface LogInfo {
  mode: FetchMode;
  queryCount: number;
  payloadKB: number;
  csrFallback: boolean;
  timestamp?: string;
  failedQueries?: string[];
  skippedQueries?: string[];
  successQueries?: number;
}

/**
 * Logs hydration information with detailed context in development mode
 *
 * @param info - Hydration information to log
 * @param enabled - Whether logging is enabled (default: true)
 */
export function logHydration(info: LogInfo, enabled: boolean = true): void {
  if (!enabled) return;

  const {
    mode,
    queryCount,
    payloadKB,
    csrFallback,
    timestamp,
    failedQueries,
    skippedQueries,
    successQueries
  } = info;

  const time = timestamp || new Date().toISOString();

  // Use console.group for better organization in dev tools
  if (queryCount > 0 || csrFallback) {
    console.group(`[${time}] [hydrate] ${mode.toUpperCase()} Mode`);

    console.log(`✓ Total Queries: ${queryCount}`);

    if (successQueries !== undefined) {
      console.log(`✓ Successful: ${successQueries}`);
    }

    console.log(`✓ Payload Size: ${Math.round(payloadKB)}KB`);

    if (csrFallback) {
      console.warn(`⚠ CSR Fallback: ${
        payloadKB > 200
          ? `Payload exceeds limit (${Math.round(payloadKB)}KB > 200KB)`
          : 'No queries to hydrate'
      }`);
    }

    if (failedQueries && failedQueries.length > 0) {
      console.warn(`⚠ Failed Queries (${failedQueries.length}):`, failedQueries);
    }

    if (skippedQueries && skippedQueries.length > 0) {
      console.log(`ℹ Skipped Queries (${skippedQueries.length}):`, skippedQueries);
    }

    console.groupEnd();
  } else {
    // Simple log for empty cases
    const modeInfo = `[hydrate] mode=${mode} queries=${queryCount} payload=${Math.round(payloadKB)}KB`;
    const fallbackMsg = csrFallback ? ' (CSR fallback)' : '';
    console.log(`[${time}] ${modeInfo}${fallbackMsg}`);
  }
}

/**
 * Logs an error with context information
 *
 * @param error - The error to log
 * @param context - Context description for where the error occurred
 */
export function logError(error: unknown, context: string): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error && error.stack ? `\n${error.stack}` : '';
  console.error(`[hydrate:error] ${context}: ${errorMessage}${stack}`);
}

/**
 * Logs a warning message
 *
 * @param message - The warning message
 */
export function logWarning(message: string): void {
  console.warn(`[hydrate:warning] ${message}`);
}

/**
 * Logs debug information (only in development)
 *
 * @param message - The debug message
 * @param data - Optional data to log
 */
export function logDebug(message: string, data?: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    if (data !== undefined) {
      console.debug(`[hydrate:debug] ${message}`, data);
    } else {
      console.debug(`[hydrate:debug] ${message}`);
    }
  }
}

import type { FetchMode } from '../detectFetchMode.js';

export interface LogInfo {
  mode: FetchMode;
  queryCount: number;
  payloadKB: number;
  csrFallback: boolean;
  timestamp?: string;
}

export function logHydration(info: LogInfo, enabled: boolean = true): void {
  if (!enabled) return;

  const { mode, queryCount, payloadKB, csrFallback, timestamp } = info;
  const time = timestamp || new Date().toISOString();
  const modeInfo = `[hydrate] mode=${mode} queries=${queryCount} payload=${Math.round(payloadKB)}KB`;
  const fallbackMsg = csrFallback ? ' (CSR fallback)' : '';

  console.log(`[${time}] ${modeInfo}${fallbackMsg}`);
}

export function logError(error: unknown, context: string): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[hydrate:error] ${context}: ${errorMessage}`);
}

export function logWarning(message: string): void {
  console.warn(`[hydrate:warning] ${message}`);
}

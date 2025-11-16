/**
 * Calculates the byte size of a serialized object
 *
 * @param obj - The object to measure
 * @returns Size in bytes
 */
export function byteSize(obj: unknown): number {
  const str = JSON.stringify(obj);
  return new TextEncoder().encode(str).length;
}

/**
 * Converts bytes to kilobytes
 *
 * @param bytes - Number of bytes
 * @returns Size in KB
 */
export function bytesToKB(bytes: number): number {
  return bytes / 1024;
}

/**
 * Formats bytes into a human-readable string
 *
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5KB", "2.3MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

/**
 * Runs async tasks with controlled concurrency
 *
 * @template T - The return type of tasks
 * @param tasks - Array of async task functions
 * @param limit - Maximum number of concurrent tasks
 * @returns Promise resolving to array of results
 *
 * @remarks
 * This function prevents overwhelming the backend with too many simultaneous requests.
 * Tasks are executed in order with a maximum of `limit` tasks running concurrently.
 *
 * @example
 * ```ts
 * const tasks = urls.map(url => () => fetch(url));
 * const results = await runWithConcurrency(tasks, 3);
 * ```
 */
export async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  if (tasks.length === 0) return [];

  const results: T[] = [];
  const queue = [...tasks];

  const workers = Array.from(
    { length: Math.min(Math.max(1, limit), tasks.length) },
    async () => {
      while (queue.length) {
        const task = queue.shift();
        if (!task) break;
        const result = await task();
        results.push(result);
      }
    }
  );

  await Promise.all(workers);
  return results;
}

/**
 * Checks if code is running in a server environment
 *
 * @returns true if server-side, false if client-side
 */
export function isServerEnvironment(): boolean {
  return typeof window === 'undefined';
}

/**
 * Checks if running in development mode
 *
 * @returns true if NODE_ENV is not 'production'
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

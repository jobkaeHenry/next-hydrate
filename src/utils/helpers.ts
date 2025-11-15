export function byteSize(obj: unknown): number {
  const str = JSON.stringify(obj);
  return new TextEncoder().encode(str).length;
}

export function bytesToKB(bytes: number): number {
  return bytes / 1024;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

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

export function isServerEnvironment(): boolean {
  return typeof window === 'undefined';
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

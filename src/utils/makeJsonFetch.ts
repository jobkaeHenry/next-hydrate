/**
 * Creates a fetch function for JSON endpoints with Next.js caching support
 *
 * @template T - The expected response type
 * @param url - The URL to fetch from
 * @param options - Fetch options including Next.js cache configuration
 * @returns A function that fetches and returns typed JSON data
 *
 * @example
 * ```ts
 * const fetchPosts = makeJsonFetch<Post[]>('/api/posts', {
 *   next: { revalidate: 60 }
 * });
 *
 * const posts = await fetchPosts();
 * ```
 */
export function makeJsonFetch<T = unknown>(
  url: string,
  options?: RequestInit & {
    next?: {
      revalidate?: number | false;
      tags?: string[];
    };
  }
): () => Promise<T> {
  return async () => {
    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error(
        `Failed to fetch ${url}: ${res.status} ${res.statusText}`
      );
    }

    return res.json() as Promise<T>;
  };
}

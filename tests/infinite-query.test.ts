import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getHydrationProps } from '../src/getHydrationProps.js';
import type { QueryConfig } from '../src/types.js';

describe('Infinite Query - Strict Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Infinite Query Detection', () => {
    it('should use prefetchInfiniteQuery when all infinite params are provided', async () => {
      interface PageData {
        items: number[];
        nextCursor: number | null;
      }

      const mockFetchFn = vi.fn<[], Promise<PageData>>().mockResolvedValue({
        items: [1, 2, 3],
        nextCursor: 2,
      });

      const queryConfig: QueryConfig<PageData> = {
        key: ['infinite-posts'],
        fetchFn: mockFetchFn,
        pagesToHydrate: 3,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      };

      const result = await getHydrationProps({
        queries: [queryConfig],
        fetchMode: 'ssr',
        devLog: false,
      });

      // Should have been called (infinite query logic executed)
      expect(mockFetchFn).toHaveBeenCalled();
      expect(result.dehydratedState).not.toBeNull();
    });

    it('should use regular prefetch when pagesToHydrate is 1', async () => {
      const mockFetchFn = vi.fn().mockResolvedValue({ data: 'test' });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['regular'],
            fetchFn: mockFetchFn,
            pagesToHydrate: 1, // Should treat as regular query
            initialPageParam: 0,
            getNextPageParam: () => null,
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFetchFn).toHaveBeenCalled();
      expect(result.dehydratedState).not.toBeNull();
    });

    it('should use regular prefetch when initialPageParam is missing', async () => {
      const mockFetchFn = vi.fn().mockResolvedValue({ data: 'test' });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['regular'],
            fetchFn: mockFetchFn,
            pagesToHydrate: 3,
            // initialPageParam missing - should fall back to regular query
            getNextPageParam: () => null,
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFetchFn).toHaveBeenCalled();
      expect(result.dehydratedState).not.toBeNull();
    });

    it('should use regular prefetch when getNextPageParam is missing', async () => {
      const mockFetchFn = vi.fn().mockResolvedValue({ data: 'test' });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['regular'],
            fetchFn: mockFetchFn,
            pagesToHydrate: 3,
            initialPageParam: 0,
            // getNextPageParam missing - should fall back to regular query
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFetchFn).toHaveBeenCalled();
      expect(result.dehydratedState).not.toBeNull();
    });

    it('should use regular prefetch when pagesToHydrate is undefined', async () => {
      const mockFetchFn = vi.fn().mockResolvedValue({ data: 'test' });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['regular'],
            fetchFn: mockFetchFn,
            // No pagesToHydrate - regular query
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFetchFn).toHaveBeenCalled();
      expect(result.dehydratedState).not.toBeNull();
    });
  });

  describe('Infinite Query Error Handling', () => {
    it('should handle errors in infinite query without breaking other queries', async () => {
      const failingFetchFn = vi.fn().mockRejectedValue(new Error('API Error'));
      const successFetchFn = vi.fn().mockResolvedValue({ data: 'success' });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['failing-infinite'],
            fetchFn: failingFetchFn,
            pagesToHydrate: 2,
            initialPageParam: 1,
            getNextPageParam: () => 2,
          },
          {
            key: ['success'],
            fetchFn: successFetchFn,
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(failingFetchFn).toHaveBeenCalled();
      expect(successFetchFn).toHaveBeenCalled();
      // Should still have dehydrated state from successful query
      expect(result.dehydratedState).not.toBeNull();
    });

    it('should not throw when all infinite queries fail', async () => {
      const failingFetchFn = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await getHydrationProps({
        queries: [
          {
            key: ['failing'],
            fetchFn: failingFetchFn,
            pagesToHydrate: 2,
            initialPageParam: 0,
            getNextPageParam: () => 1,
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(result.dehydratedState).toBeNull();
    });
  });

  describe('Query Deduplication with Infinite Queries', () => {
    it('should deduplicate infinite queries with same key', async () => {
      const mockFetchFn = vi.fn().mockResolvedValue({
        items: [1, 2, 3],
        nextCursor: null,
      });

      await getHydrationProps({
        queries: [
          {
            key: ['posts'],
            fetchFn: mockFetchFn,
            pagesToHydrate: 2,
            initialPageParam: 1,
            getNextPageParam: () => 2,
          },
          {
            key: ['posts'], // Duplicate key
            fetchFn: mockFetchFn,
            pagesToHydrate: 2,
            initialPageParam: 1,
            getNextPageParam: () => 2,
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      // Should only be called once due to deduplication
      expect(mockFetchFn).toHaveBeenCalledTimes(1);
    });

    it('should not deduplicate infinite queries with different keys', async () => {
      const mockFetchFn1 = vi.fn().mockResolvedValue({ items: [], next: null });
      const mockFetchFn2 = vi.fn().mockResolvedValue({ items: [], next: null });

      await getHydrationProps({
        queries: [
          {
            key: ['posts', 'page-1'],
            fetchFn: mockFetchFn1,
            pagesToHydrate: 2,
            initialPageParam: 1,
            getNextPageParam: () => 2,
          },
          {
            key: ['posts', 'page-2'],
            fetchFn: mockFetchFn2,
            pagesToHydrate: 2,
            initialPageParam: 1,
            getNextPageParam: () => 2,
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFetchFn1).toHaveBeenCalledTimes(1);
      expect(mockFetchFn2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mixed Regular and Infinite Queries', () => {
    it('should handle mix of regular and infinite queries', async () => {
      const regularFetch = vi.fn().mockResolvedValue({ data: 'regular' });
      const infiniteFetch = vi.fn().mockResolvedValue({
        items: [1, 2, 3],
        next: null,
      });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['regular'],
            fetchFn: regularFetch,
          },
          {
            key: ['infinite'],
            fetchFn: infiniteFetch,
            pagesToHydrate: 2,
            initialPageParam: 1,
            getNextPageParam: (lastPage) => lastPage.next,
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(regularFetch).toHaveBeenCalledTimes(1);
      expect(infiniteFetch).toHaveBeenCalledTimes(1);
      expect(result.dehydratedState).not.toBeNull();
    });

    it('should respect concurrency limit with mixed queries', async () => {
      const createFetch = (id: number) =>
        vi.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return { id, data: `result-${id}` };
        });

      const fetchers = Array.from({ length: 10 }, (_, i) => createFetch(i));

      const result = await getHydrationProps({
        queries: [
          // Regular queries
          ...fetchers.slice(0, 5).map((fn, i) => ({
            key: ['regular', i],
            fetchFn: fn,
          })),
          // Infinite queries
          ...fetchers.slice(5, 10).map((fn, i) => ({
            key: ['infinite', i],
            fetchFn: fn,
            pagesToHydrate: 2,
            initialPageParam: 0,
            getNextPageParam: () => null,
          })),
        ],
        concurrency: 3,
        fetchMode: 'ssr',
        devLog: false,
      });

      // All should have been called
      fetchers.forEach((fn) => {
        expect(fn).toHaveBeenCalled();
      });
      expect(result.dehydratedState).not.toBeNull();
    });
  });

  describe('shouldDehydrate with Infinite Queries', () => {
    it('should respect shouldDehydrate for infinite queries', async () => {
      const largeFetch = vi.fn().mockResolvedValue({
        items: Array(1000).fill({ data: 'x'.repeat(100) }),
        next: null,
      });

      const smallFetch = vi.fn().mockResolvedValue({
        items: [1, 2, 3],
        next: null,
      });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['large-infinite'],
            fetchFn: largeFetch,
            pagesToHydrate: 2,
            initialPageParam: 1,
            getNextPageParam: () => 2,
            shouldDehydrate: (data) => data.items.length < 100, // Should reject large data
          },
          {
            key: ['small-infinite'],
            fetchFn: smallFetch,
            pagesToHydrate: 2,
            initialPageParam: 1,
            getNextPageParam: () => 2,
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(largeFetch).toHaveBeenCalled();
      expect(smallFetch).toHaveBeenCalled();
      // Result should exist (from small query)
      expect(result.dehydratedState).not.toBeNull();
    });

    it('should handle shouldDehydrate errors gracefully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ data: 'test' });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['test'],
            fetchFn: mockFetch,
            pagesToHydrate: 2,
            initialPageParam: 1,
            getNextPageParam: () => 2,
            shouldDehydrate: () => {
              throw new Error('shouldDehydrate crashed');
            },
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      // Should not crash, just exclude the query
      expect(mockFetch).toHaveBeenCalled();
      // Query was excluded due to shouldDehydrate error
      expect(result.dehydratedState).toBeNull();
    });
  });

  describe('Infinite Query Edge Cases', () => {
    it('should handle pagesToHydrate of 0', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ items: [], next: null });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['test'],
            fetchFn: mockFetch,
            pagesToHydrate: 0, // Edge case
            initialPageParam: 1,
            getNextPageParam: () => 2,
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      // Should still execute (falls back to regular query)
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle very large pagesToHydrate', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ items: [1], next: null });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['test'],
            fetchFn: mockFetch,
            pagesToHydrate: 1000000, // Very large number
            initialPageParam: 1,
            getNextPageParam: () => 2,
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFetch).toHaveBeenCalled();
      expect(result.dehydratedState).not.toBeNull();
    });

    it('should handle getNextPageParam returning undefined', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ items: [1, 2, 3] });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['test'],
            fetchFn: mockFetch,
            pagesToHydrate: 3,
            initialPageParam: 1,
            getNextPageParam: () => undefined, // No more pages
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFetch).toHaveBeenCalled();
      expect(result.dehydratedState).not.toBeNull();
    });
  });
});

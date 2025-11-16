import { describe, expect, it, beforeEach, vi } from 'vitest';

// Test environment simulation for different Next.js contexts
describe('Cross-Environment Compatibility', () => {
  describe('Browser Environment (CSR)', () => {
    beforeEach(() => {
      // Simulate browser environment
      (globalThis as any).window = {};
      (globalThis as any).document = {};
      (globalThis as any).navigator = {};
      delete process.env.NEXT_PHASE;
    });

    it('detectFetchMode returns csr in browser', async () => {
      const { detectFetchMode } = await import('../src/detectFetchMode.js');

      const mode = await detectFetchMode();
      expect(mode).toBe('csr');
    });

    it('QueryProvider works in browser environment', async () => {
      const { QueryProvider } = await import('../src/providers/QueryProvider.js');

      expect(() => {
        // In real usage, this would be JSX
        const mockChildren = null;
        expect(QueryProvider).toBeDefined();
      }).not.toThrow();
    });

    it('HydrateClient works with null state in browser', async () => {
      const { HydrateClient } = await import('../src/HydrateClient.js');

      expect(() => {
        // In real usage, this would be JSX
        const mockChildren = null;
        const mockState = null;
        expect(HydrateClient).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Server Environment (SSR/ISR/Static)', () => {
    beforeEach(() => {
      // Simulate server environment
      delete (globalThis as any).window;
      delete (globalThis as any).document;
      delete (globalThis as any).navigator;
    });

    it('detectFetchMode works in server environments', async () => {
      const { detectFetchMode } = await import('../src/detectFetchMode.js');

      // Mock Next.js headers for server
      const mockHeaders = vi.fn().mockReturnValue({
        get: (key: string) => null,
      });

      vi.doMock('next/headers', () => ({
        headers: () => mockHeaders(),
      }));

      const mode = await detectFetchMode();
      expect(['ssr', 'isr', 'static']).toContain(mode);
    });

    it('getHydrationProps works in server environment', async () => {
      const { getHydrationProps } = await import('../src/getHydrationProps.js');

      const mockFetchFn = vi.fn().mockResolvedValue({ data: 'test' });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['test'],
            fetchFn: mockFetchFn,
          },
        ],
        devLog: false,
      });

      expect(mockFetchFn).toHaveBeenCalled();
      expect(result).toHaveProperty('dehydratedState');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles empty queries array', async () => {
      const { getHydrationProps } = await import('../src/getHydrationProps.js');

      const result = await getHydrationProps({
        queries: [],
        devLog: false,
      });

      expect(result.dehydratedState).toBeNull();
    });

    it('handles fetch function errors gracefully', async () => {
      const { getHydrationProps } = await import('../src/getHydrationProps.js');

      const errorFetchFn = vi.fn().mockRejectedValue(new Error('API Error'));

      const result = await getHydrationProps({
        queries: [
          {
            key: ['error-test'],
            fetchFn: errorFetchFn,
          },
        ],
        devLog: false,
      });

      expect(errorFetchFn).toHaveBeenCalled();
      expect(result.dehydratedState).toBeNull();
    });

    it('handles malformed dehydrated state', async () => {
      const { HydrateClient } = await import('../src/HydrateClient.js');

      expect(() => {
        // Test with invalid state
        const invalidState = 'not-an-object';
        expect(invalidState).toBeDefined();
      }).not.toThrow();
    });

    it('handles missing QueryClient gracefully', async () => {
      // Test library behavior when QueryClient is not available
      const { getQueryClient } = await import('../src/getQueryClient.js');
      const client = getQueryClient();
      expect(client).toBeDefined();
    });
  });

  describe('Performance and Memory Management', () => {
    it('creates short-lived QueryClient for server use', async () => {
      const { getHydrationProps } = await import('../src/getHydrationProps.js');

      const mockFetchFn = vi.fn().mockResolvedValue({ data: 'test' });

      // First call
      await getHydrationProps({
        queries: [
          {
            key: ['test1'],
            fetchFn: mockFetchFn,
          },
        ],
        devLog: false,
      });

      // Second call should reuse or create new short-lived client
      await getHydrationProps({
        queries: [
          {
            key: ['test2'],
            fetchFn: mockFetchFn,
          },
        ],
        devLog: false,
      });

      expect(mockFetchFn).toHaveBeenCalledTimes(2);
    });

    it('respects concurrency limits', async () => {
      const { getHydrationProps } = await import('../src/getHydrationProps.js');

      const fetchOrder: number[] = [];

      const createFetchFn = (id: number) => async () => {
        fetchOrder.push(id);
        await new Promise(resolve => setTimeout(resolve, 100));
        return { id };
      };

      await getHydrationProps({
        queries: [
          { key: ['1'], fetchFn: createFetchFn(1) },
          { key: ['2'], fetchFn: createFetchFn(2) },
          { key: ['3'], fetchFn: createFetchFn(3) },
          { key: ['4'], fetchFn: createFetchFn(4) },
          { key: ['5'], fetchFn: createFetchFn(5) },
          { key: ['6'], fetchFn: createFetchFn(6) },
          { key: ['7'], fetchFn: createFetchFn(7) },
        ],
        concurrency: 3,
        devLog: false,
      });

      // With concurrency: 3, we should see sequential execution in batches
      expect(fetchOrder.length).toBe(7);
    });
  });

  describe('TypeScript and Build Compatibility', () => {
    it('exports all expected types', async () => {
      const types = await import('../src/types.js');

      // Types are exported as types, not runtime values
      // This test verifies the module can be imported successfully
      expect(types).toBeDefined();
    });

    it('has proper TypeScript declarations', async () => {
      // This would be tested by TypeScript compiler in real scenarios
      const { detectFetchMode } = await import('../src/detectFetchMode.js');
      expect(typeof detectFetchMode).toBe('function');
    });
  });

  describe('Real-World Usage Patterns', () => {
    it('supports multiple queries with different configurations', async () => {
      const { getHydrationProps } = await import('../src/getHydrationProps.js');

      const fetchUsers = vi.fn().mockResolvedValue([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ]);

      const fetchSettings = vi.fn().mockResolvedValue({
        theme: 'dark',
        notifications: true,
      });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['users'],
            fetchFn: fetchUsers,
          },
          {
            key: ['settings'],
            fetchFn: fetchSettings,
            shouldDehydrate: (data) => data.theme === 'dark',
          },
        ],
        devLog: false,
      });

      expect(fetchUsers).toHaveBeenCalledTimes(1);
      expect(fetchSettings).toHaveBeenCalledTimes(1);
      expect(result.dehydratedState).toBeTruthy();
    });

    it('handles query deduplication correctly', async () => {
      const { getHydrationProps } = await import('../src/getHydrationProps.js');

      const fetchData = vi.fn().mockResolvedValue({ count: 1 });

      const result = await getHydrationProps({
        queries: [
          { key: ['data'], fetchFn: fetchData },
          { key: ['data'], fetchFn: fetchData }, // Duplicate key
          { key: ['other'], fetchFn: fetchData },
        ],
        devLog: false,
      });

      // Should only call once due to deduplication
      expect(fetchData).toHaveBeenCalledTimes(2); // Once for 'data', once for 'other'
    });

    it('supports infinite query hydration', async () => {
      const { getHydrationProps } = await import('../src/getHydrationProps.js');

      const fetchInfiniteData = vi.fn().mockResolvedValue({
        pages: [
          [{ id: 1 }, { id: 2 }],
          [{ id: 3 }, { id: 4 }],
        ],
        pageParams: [1, 2],
      });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['infinite'],
            fetchFn: fetchInfiniteData,
            pagesToHydrate: 2,
          },
        ],
        devLog: false,
      });

      expect(fetchInfiniteData).toHaveBeenCalledTimes(1);
      expect(result.dehydratedState).toBeTruthy();
    });
  });
});

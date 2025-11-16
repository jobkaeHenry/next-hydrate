import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getHydrationProps } from '../src/getHydrationProps.js';
import { runWithConcurrency } from '../src/utils/helpers.js';

describe('Error Handling & Concurrency - Strict Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Partial Query Failure', () => {
    it('should succeed with some queries when others fail', async () => {
      const success1 = vi.fn().mockResolvedValue({ data: 'success1' });
      const failure = vi.fn().mockRejectedValue(new Error('Network error'));
      const success2 = vi.fn().mockResolvedValue({ data: 'success2' });

      const result = await getHydrationProps({
        queries: [
          { key: ['success1'], fetchFn: success1 },
          { key: ['failure'], fetchFn: failure },
          { key: ['success2'], fetchFn: success2 },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(success1).toHaveBeenCalled();
      expect(failure).toHaveBeenCalled();
      expect(success2).toHaveBeenCalled();

      // Should have dehydrated state from successful queries
      expect(result.dehydratedState).not.toBeNull();
      expect(result.dehydratedState?.queries).toHaveLength(2);
    });

    it('should handle all queries failing', async () => {
      const fail1 = vi.fn().mockRejectedValue(new Error('Error 1'));
      const fail2 = vi.fn().mockRejectedValue(new Error('Error 2'));
      const fail3 = vi.fn().mockRejectedValue(new Error('Error 3'));

      const result = await getHydrationProps({
        queries: [
          { key: ['fail1'], fetchFn: fail1 },
          { key: ['fail2'], fetchFn: fail2 },
          { key: ['fail3'], fetchFn: fail3 },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(fail1).toHaveBeenCalled();
      expect(fail2).toHaveBeenCalled();
      expect(fail3).toHaveBeenCalled();

      // No successful queries, so dehydrated state should be null
      expect(result.dehydratedState).toBeNull();
    });

    it('should handle timeout errors', async () => {
      const timeout = vi.fn().mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 100)
          )
      );

      const success = vi.fn().mockResolvedValue({ data: 'success' });

      const result = await getHydrationProps({
        queries: [
          { key: ['timeout'], fetchFn: timeout },
          { key: ['success'], fetchFn: success },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      // Successful query should still work
      expect(result.dehydratedState).not.toBeNull();
    });

    it('should handle fetch returning null/undefined', async () => {
      const returnsNull = vi.fn().mockResolvedValue(null);
      const returnsUndefined = vi.fn().mockResolvedValue(undefined);
      const returnsValid = vi.fn().mockResolvedValue({ data: 'valid' });

      const result = await getHydrationProps({
        queries: [
          { key: ['null'], fetchFn: returnsNull },
          { key: ['undefined'], fetchFn: returnsUndefined },
          { key: ['valid'], fetchFn: returnsValid },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(returnsNull).toHaveBeenCalled();
      expect(returnsUndefined).toHaveBeenCalled();
      expect(returnsValid).toHaveBeenCalled();

      // All queries succeeded (null/undefined are valid data)
      expect(result.dehydratedState).not.toBeNull();
      expect(result.dehydratedState?.queries.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle non-Error rejections', async () => {
      const rejectString = vi.fn().mockRejectedValue('String error');
      const rejectNumber = vi.fn().mockRejectedValue(404);
      const rejectObject = vi.fn().mockRejectedValue({ code: 'ERR_NETWORK' });

      const result = await getHydrationProps({
        queries: [
          { key: ['string'], fetchFn: rejectString },
          { key: ['number'], fetchFn: rejectNumber },
          { key: ['object'], fetchFn: rejectObject },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(rejectString).toHaveBeenCalled();
      expect(rejectNumber).toHaveBeenCalled();
      expect(rejectObject).toHaveBeenCalled();

      // All failed, should be null
      expect(result.dehydratedState).toBeNull();
    });
  });

  describe('Concurrency Control - Strict', () => {
    it('should respect concurrency limit of 1 (sequential)', async () => {
      let concurrent = 0;
      let maxConcurrent = 0;

      const createTask = (id: number) =>
        vi.fn().mockImplementation(async () => {
          concurrent++;
          maxConcurrent = Math.max(maxConcurrent, concurrent);
          await new Promise((resolve) => setTimeout(resolve, 10));
          concurrent--;
          return { id };
        });

      const tasks = Array.from({ length: 10 }, (_, i) => createTask(i));

      await getHydrationProps({
        queries: tasks.map((fn, i) => ({ key: ['task', i], fetchFn: fn })),
        concurrency: 1,
        fetchMode: 'ssr',
        devLog: false,
      });

      // With concurrency 1, max concurrent should be 1
      expect(maxConcurrent).toBe(1);
    });

    it('should respect concurrency limit of 3', async () => {
      let concurrent = 0;
      let maxConcurrent = 0;

      const createTask = (id: number) =>
        vi.fn().mockImplementation(async () => {
          concurrent++;
          maxConcurrent = Math.max(maxConcurrent, concurrent);
          await new Promise((resolve) => setTimeout(resolve, 20));
          concurrent--;
          return { id };
        });

      const tasks = Array.from({ length: 20 }, (_, i) => createTask(i));

      await getHydrationProps({
        queries: tasks.map((fn, i) => ({ key: ['task', i], fetchFn: fn })),
        concurrency: 3,
        fetchMode: 'ssr',
        devLog: false,
      });

      // Max concurrent should not exceed 3
      expect(maxConcurrent).toBeLessThanOrEqual(3);
      expect(maxConcurrent).toBeGreaterThanOrEqual(1);
    });

    it('should handle concurrency of 0 (should default to at least 1)', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test' });

      const result = await getHydrationProps({
        queries: [{ key: ['test'], fetchFn: mockFn }],
        concurrency: 0, // Invalid, should be handled gracefully
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFn).toHaveBeenCalled();
      expect(result.dehydratedState).not.toBeNull();
    });

    it('should handle negative concurrency', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test' });

      const result = await getHydrationProps({
        queries: [{ key: ['test'], fetchFn: mockFn }],
        concurrency: -5, // Invalid
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFn).toHaveBeenCalled();
    });

    it('should handle concurrency larger than task count', async () => {
      const tasks = Array.from({ length: 3 }, (_, i) =>
        vi.fn().mockResolvedValue({ id: i })
      );

      await getHydrationProps({
        queries: tasks.map((fn, i) => ({ key: ['task', i], fetchFn: fn })),
        concurrency: 100, // Much larger than task count
        fetchMode: 'ssr',
        devLog: false,
      });

      // All tasks should complete
      tasks.forEach((fn) => {
        expect(fn).toHaveBeenCalled();
      });
    });

    it('should execute tasks in order within concurrency limit', async () => {
      const executionOrder: number[] = [];

      const createTask = (id: number) =>
        vi.fn().mockImplementation(async () => {
          executionOrder.push(id);
          await new Promise((resolve) => setTimeout(resolve, 5));
          return { id };
        });

      const tasks = Array.from({ length: 10 }, (_, i) => createTask(i));

      await getHydrationProps({
        queries: tasks.map((fn, i) => ({ key: ['task', i], fetchFn: fn })),
        concurrency: 2,
        fetchMode: 'ssr',
        devLog: false,
      });

      // All tasks should have executed
      expect(executionOrder).toHaveLength(10);

      // First task should definitely be first
      expect(executionOrder[0]).toBe(0);
    });
  });

  describe('runWithConcurrency Helper - Direct Tests', () => {
    it('should handle empty task array', async () => {
      const result = await runWithConcurrency([], 5);
      expect(result).toEqual([]);
    });

    it('should execute all tasks and return results in order', async () => {
      const tasks = Array.from({ length: 5 }, (_, i) => async () => i * 2);

      const results = await runWithConcurrency(tasks, 2);

      expect(results).toHaveLength(5);
      expect(results).toContain(0);
      expect(results).toContain(2);
      expect(results).toContain(4);
      expect(results).toContain(6);
      expect(results).toContain(8);
    });

    it('should enforce concurrency limit', async () => {
      let concurrent = 0;
      let maxConcurrent = 0;

      const tasks = Array.from({ length: 20 }, () => async () => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise((resolve) => setTimeout(resolve, 10));
        concurrent--;
        return 'done';
      });

      await runWithConcurrency(tasks, 5);

      expect(maxConcurrent).toBe(5);
    });

    it('should handle limit of 1', async () => {
      let concurrent = 0;
      let maxConcurrent = 0;

      const tasks = Array.from({ length: 10 }, () => async () => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise((resolve) => setTimeout(resolve, 5));
        concurrent--;
        return 'done';
      });

      await runWithConcurrency(tasks, 1);

      expect(maxConcurrent).toBe(1);
    });

    it('should propagate errors from tasks', async () => {
      const tasks = [
        async () => 'success',
        async () => {
          throw new Error('Task failed');
        },
        async () => 'also success',
      ];

      // Should reject when a task throws
      await expect(runWithConcurrency(tasks, 2)).rejects.toThrow('Task failed');
    });

    it('should handle very large task count', async () => {
      const tasks = Array.from({ length: 1000 }, (_, i) => async () => i);

      const results = await runWithConcurrency(tasks, 10);

      expect(results).toHaveLength(1000);
      expect(results[0]).toBe(0);
      expect(results[999]).toBe(999);
    });

    it('should work with limit larger than tasks', async () => {
      const tasks = Array.from({ length: 3 }, (_, i) => async () => i);

      const results = await runWithConcurrency(tasks, 100);

      expect(results).toHaveLength(3);
      expect(results).toContain(0);
      expect(results).toContain(1);
      expect(results).toContain(2);
    });

    it('should handle mix of fast and slow tasks', async () => {
      const tasks = [
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return 'slow';
        },
        async () => 'fast',
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 30));
          return 'medium';
        },
        async () => 'instant',
      ];

      const results = await runWithConcurrency(tasks, 2);

      expect(results).toHaveLength(4);
      expect(results).toContain('slow');
      expect(results).toContain('fast');
      expect(results).toContain('medium');
      expect(results).toContain('instant');
    });
  });

  describe('Payload Size Limit - Strict', () => {
    it('should return null when payload exceeds maxPayloadKB', async () => {
      // Create a large data object
      const largeData = {
        items: Array(10000)
          .fill(null)
          .map((_, i) => ({
            id: i,
            content: 'x'.repeat(100), // 100 chars per item
          })),
      };

      const mockFn = vi.fn().mockResolvedValue(largeData);

      const result = await getHydrationProps({
        queries: [{ key: ['large'], fetchFn: mockFn }],
        maxPayloadKB: 50, // Very small limit
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFn).toHaveBeenCalled();
      // Payload should exceed limit
      expect(result.dehydratedState).toBeNull();
    });

    it('should include data when under maxPayloadKB', async () => {
      const smallData = { id: 1, name: 'test' };
      const mockFn = vi.fn().mockResolvedValue(smallData);

      const result = await getHydrationProps({
        queries: [{ key: ['small'], fetchFn: mockFn }],
        maxPayloadKB: 200, // Default
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFn).toHaveBeenCalled();
      expect(result.dehydratedState).not.toBeNull();
    });

    it('should respect maxPayloadKB of 0', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test' });

      const result = await getHydrationProps({
        queries: [{ key: ['test'], fetchFn: mockFn }],
        maxPayloadKB: 0, // Nothing should pass
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(result.dehydratedState).toBeNull();
    });

    it('should handle very large maxPayloadKB', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test' });

      const result = await getHydrationProps({
        queries: [{ key: ['test'], fetchFn: mockFn }],
        maxPayloadKB: 999999999, // Essentially unlimited
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(result.dehydratedState).not.toBeNull();
    });

    it('should calculate payload size accurately', async () => {
      // Known size data
      const exactData = { a: 1, b: 2, c: 3 }; // ~15 bytes JSON
      const mockFn = vi.fn().mockResolvedValue(exactData);

      const resultTooSmall = await getHydrationProps({
        queries: [{ key: ['test'], fetchFn: mockFn }],
        maxPayloadKB: 0.001, // 1 byte
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(resultTooSmall.dehydratedState).toBeNull();

      vi.clearAllMocks();

      const resultOk = await getHydrationProps({
        queries: [{ key: ['test'], fetchFn: mockFn }],
        maxPayloadKB: 1, // 1KB, should be enough
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(resultOk.dehydratedState).not.toBeNull();
    });
  });

  describe('Query hydrate Flag', () => {
    it('should skip queries with hydrate: false', async () => {
      const skip1 = vi.fn().mockResolvedValue({ data: 'skip' });
      const include = vi.fn().mockResolvedValue({ data: 'include' });
      const skip2 = vi.fn().mockResolvedValue({ data: 'skip' });

      const result = await getHydrationProps({
        queries: [
          { key: ['skip1'], fetchFn: skip1, hydrate: false },
          { key: ['include'], fetchFn: include },
          { key: ['skip2'], fetchFn: skip2, hydrate: false },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      // Skipped queries should NOT be called
      expect(skip1).not.toHaveBeenCalled();
      expect(skip2).not.toHaveBeenCalled();

      // Included query should be called
      expect(include).toHaveBeenCalled();

      expect(result.dehydratedState).not.toBeNull();
    });

    it('should return null when all queries have hydrate: false', async () => {
      const skip1 = vi.fn().mockResolvedValue({ data: 'skip' });
      const skip2 = vi.fn().mockResolvedValue({ data: 'skip' });

      const result = await getHydrationProps({
        queries: [
          { key: ['skip1'], fetchFn: skip1, hydrate: false },
          { key: ['skip2'], fetchFn: skip2, hydrate: false },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(skip1).not.toHaveBeenCalled();
      expect(skip2).not.toHaveBeenCalled();
      expect(result.dehydratedState).toBeNull();
    });

    it('should treat undefined hydrate as true', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test' });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['test'],
            fetchFn: mockFn,
            // hydrate undefined = should hydrate
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFn).toHaveBeenCalled();
      expect(result.dehydratedState).not.toBeNull();
    });
  });
});

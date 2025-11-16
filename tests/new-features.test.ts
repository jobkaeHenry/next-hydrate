import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { HydrationError, isHydrationError } from '../src/errors.js';
import { makeJsonFetch } from '../src/utils/makeJsonFetch.js';

describe('New Features - Strict Tests', () => {
  describe('HydrationError', () => {
    it('should create error with all required properties', () => {
      const queryKey = ['users', 123];
      const originalError = new Error('Network timeout');
      const error = new HydrationError(
        'Failed to fetch users',
        queryKey,
        originalError
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(HydrationError);
      expect(error.name).toBe('HydrationError');
      expect(error.message).toBe('Failed to fetch users');
      expect(error.queryKey).toEqual(queryKey);
      expect(error.originalError).toBe(originalError);
      expect(error.shouldLog).toBe(true);
    });

    it('should support custom shouldLog flag', () => {
      const error = new HydrationError(
        'Test error',
        ['test'],
        new Error('Original'),
        false
      );

      expect(error.shouldLog).toBe(false);
    });

    it('should format query key correctly', () => {
      const error = new HydrationError(
        'Test',
        ['posts', { page: 1 }],
        new Error()
      );

      expect(error.getQueryKeyString()).toBe('["posts",{"page":1}]');
    });

    it('should provide detailed error message', () => {
      const error = new HydrationError(
        'Prefetch failed',
        ['users'],
        new Error('API Error: 500')
      );

      const detailed = error.getDetailedMessage();
      expect(detailed).toContain('Prefetch failed');
      expect(detailed).toContain('["users"]');
      expect(detailed).toContain('API Error: 500');
    });

    it('should handle non-Error original errors', () => {
      const error = new HydrationError(
        'Failed',
        ['test'],
        'String error message'
      );

      const detailed = error.getDetailedMessage();
      expect(detailed).toContain('String error message');
    });

    it('should be identifiable via isHydrationError', () => {
      const hydrationErr = new HydrationError('Test', ['key'], new Error());
      const normalErr = new Error('Normal error');

      expect(isHydrationError(hydrationErr)).toBe(true);
      expect(isHydrationError(normalErr)).toBe(false);
      expect(isHydrationError('not an error')).toBe(false);
      expect(isHydrationError(null)).toBe(false);
      expect(isHydrationError(undefined)).toBe(false);
    });

    it('should maintain proper stack trace', () => {
      const error = new HydrationError('Test', ['key'], new Error());
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('HydrationError');
    });
  });

  describe('makeJsonFetch', () => {
    beforeEach(() => {
      // Mock global fetch
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should create a function that fetches and parses JSON', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const fetchFn = makeJsonFetch<typeof mockData>('/api/test');
      const result = await fetchFn();

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/test', undefined);
    });

    it('should pass Next.js cache options correctly', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const options = {
        next: {
          revalidate: 60,
          tags: ['posts', 'users'],
        },
      };

      const fetchFn = makeJsonFetch('/api/posts', options);
      await fetchFn();

      expect(global.fetch).toHaveBeenCalledWith('/api/posts', options);
    });

    it('should pass standard fetch options', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: 'test' }),
      };

      const fetchFn = makeJsonFetch('/api/endpoint', options);
      await fetchFn();

      expect(global.fetch).toHaveBeenCalledWith('/api/endpoint', options);
    });

    it('should throw error when response is not ok', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const fetchFn = makeJsonFetch('/api/missing');

      await expect(fetchFn()).rejects.toThrow(
        'Failed to fetch /api/missing: 404 Not Found'
      );
    });

    it('should throw error when response is 500', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const fetchFn = makeJsonFetch('/api/error');

      await expect(fetchFn()).rejects.toThrow(
        'Failed to fetch /api/error: 500 Internal Server Error'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const fetchFn = makeJsonFetch('/api/test');

      await expect(fetchFn()).rejects.toThrow('Network error');
    });

    it('should handle JSON parse errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const fetchFn = makeJsonFetch('/api/test');

      await expect(fetchFn()).rejects.toThrow('Invalid JSON');
    });

    it('should support TypeScript generics', async () => {
      interface User {
        id: number;
        email: string;
      }

      const mockUser: User = { id: 1, email: 'test@example.com' };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const fetchFn = makeJsonFetch<User>('/api/user');
      const result = await fetchFn();

      // TypeScript should infer the type correctly
      expect(result.id).toBe(1);
      expect(result.email).toBe('test@example.com');
    });

    it('should work with arrays', async () => {
      const mockArray = [1, 2, 3, 4, 5];
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockArray,
      });

      const fetchFn = makeJsonFetch<number[]>('/api/numbers');
      const result = await fetchFn();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockArray);
    });

    it('should handle empty responses', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      const fetchFn = makeJsonFetch('/api/empty');
      const result = await fetchFn();

      expect(result).toBeNull();
    });

    it('should be callable multiple times', async () => {
      const mockData = { count: 0 };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ ...mockData, count: mockData.count++ }),
      });

      const fetchFn = makeJsonFetch<{ count: number }>('/api/counter');

      await fetchFn();
      await fetchFn();
      await fetchFn();

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should combine Next.js and standard fetch options', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const fetchFn = makeJsonFetch('/api/test', {
        method: 'POST',
        headers: { Authorization: 'Bearer token' },
        next: { revalidate: 3600 },
      });

      await fetchFn();

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: { Authorization: 'Bearer token' },
        next: { revalidate: 3600 },
      });
    });
  });
});

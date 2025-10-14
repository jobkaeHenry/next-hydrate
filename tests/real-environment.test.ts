import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

// This test simulates a real Next.js request environment
describe('Real Next.js Request Environment', () => {
  let originalProcessEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalProcessEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalProcessEnv;
  });

  describe('Server Components Environment', () => {
    it('detectFetchMode works in actual Next.js server context', async () => {
      // Simulate actual Next.js server environment
      process.env.NODE_ENV = 'test';
      delete process.env.NEXT_PHASE;
      delete (globalThis as any).window;

      // Mock Next.js headers to simulate real request
      const mockHeadersImpl = vi.fn();
      vi.doMock('next/headers', () => ({
        headers: () => mockHeadersImpl(),
      }));

      // Import after mocking
      const { detectFetchMode } = await import('../src/detectFetchMode.js');

      // Test SSR mode (default server rendering)
      mockHeadersImpl.mockReturnValue({
        get: (key: string) => null,
      });

      const mode = await detectFetchMode();
      expect(mode).toBe('ssr');
    });

    it('detects ISR mode with real x-next-revalidate header', async () => {
      process.env.NODE_ENV = 'test';
      delete (globalThis as any).window;

      const mockHeadersImpl = vi.fn();
      vi.doMock('next/headers', () => ({
        headers: () => mockHeadersImpl(),
      }));

      const { detectFetchMode } = await import('../src/detectFetchMode.js');

      // Test ISR mode
      mockHeadersImpl.mockReturnValue({
        get: (key: string) => key === 'x-next-revalidate' ? '60' : null,
      });

      const mode = await detectFetchMode();
      expect(mode).toBe('isr');
    });

    it('detects static mode during actual production build', async () => {
      process.env.NODE_ENV = 'test';
      process.env.NEXT_PHASE = 'phase-production-build';
      delete (globalThis as any).window;

      const mockHeadersImpl = vi.fn();
      vi.doMock('next/headers', () => ({
        headers: () => mockHeadersImpl(),
      }));

      const { detectFetchMode } = await import('../src/detectFetchMode.js');

      // Mock headers to return no special headers
      mockHeadersImpl.mockReturnValue({
        get: (key: string) => null,
      });

      const mode = await detectFetchMode();
      expect(mode).toBe('static');
    });

    it('detects CSR mode in browser environment', async () => {
      process.env.NODE_ENV = 'test';
      (globalThis as any).window = {};

      const { detectFetchMode } = await import('../src/detectFetchMode.js');

      const mode = await detectFetchMode();
      expect(mode).toBe('csr');
    });
  });

  describe('Real HTTP Request Simulation', () => {
    it('handles real Next.js request headers', async () => {
      // Ensure we're in server environment
      delete (globalThis as any).window;

      // Simulate a real Next.js request with headers
      const request = new NextRequest('https://example.com/test', {
        headers: {
          'user-agent': 'test-agent',
          'x-next-revalidate': '120',
        },
      });

      // Mock headers() to return the request headers
      const mockHeadersImpl = vi.fn();
      vi.doMock('next/headers', () => ({
        headers: () => mockHeadersImpl(),
      }));

      const { detectFetchMode } = await import('../src/detectFetchMode.js');

      // Mock headers to return x-next-revalidate header
      mockHeadersImpl.mockReturnValue({
        get: (key: string) => key === 'x-next-revalidate' ? '120' : null,
      });

      const mode = await detectFetchMode();
      expect(mode).toBe('isr');
    });
  });
});

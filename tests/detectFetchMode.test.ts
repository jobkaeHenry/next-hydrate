import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

const headersMock = vi.fn();

vi.mock('next/headers', () => ({
  headers: () => headersMock(),
}));

describe('detectFetchMode', () => {
  beforeEach(() => {
    headersMock.mockImplementation(() => ({
      get: () => null,
    }));
    delete (globalThis as any).window;
    delete process.env.NEXT_PHASE;
  });

  afterEach(() => {
    headersMock.mockReset();
  });

  it('returns csr when window is defined', async () => {
    (globalThis as any).window = {};
    const { detectFetchMode } = await import('../src/detectFetchMode.js');
    expect(detectFetchMode()).toBe('csr');
  });

  it('returns csr when next-router-prefetch header is present', async () => {
    headersMock.mockImplementation(() => ({
      get: (key: string) => (key === 'next-router-prefetch' ? '1' : null),
    }));
    const { detectFetchMode } = await import('../src/detectFetchMode.js');
    expect(detectFetchMode()).toBe('csr');
  });

  it('returns isr when x-next-revalidate header is present', async () => {
    headersMock.mockImplementation(() => ({
      get: (key: string) => (key === 'x-next-revalidate' ? '60' : null),
    }));
    const { detectFetchMode } = await import('../src/detectFetchMode.js');
    expect(detectFetchMode()).toBe('isr');
  });

  it('returns static during production build', async () => {
    process.env.NEXT_PHASE = 'phase-production-build';
    const { detectFetchMode } = await import('../src/detectFetchMode.js');
    expect(detectFetchMode()).toBe('static');
  });

  it('defaults to ssr otherwise', async () => {
    const { detectFetchMode } = await import('../src/detectFetchMode.js');
    expect(detectFetchMode()).toBe('ssr');
  });
});

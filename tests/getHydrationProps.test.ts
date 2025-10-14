import { describe, expect, it, vi } from 'vitest';
import { QueryClient, hydrate } from '@tanstack/react-query';
import { getHydrationProps } from '../src/getHydrationProps.js';

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

// Define types for test data
type TestData = { message: string };
type SecretData = { secret: boolean };
type BigData = number[];
type RandomData = { value: number };

// Mock detectFetchMode to avoid calling headers() outside request scope
vi.mock('../src/detectFetchMode.js', () => ({
  detectFetchMode: vi.fn(),
}));

describe('getHydrationProps', () => {
  it('skips hydration on csr mode', async () => {
    const { detectFetchMode } = await import('../src/detectFetchMode.js');
    vi.mocked(detectFetchMode).mockResolvedValue('csr');

    const fetchFn = vi.fn(async (): Promise<TestData> => ({ message: 'hello' }));
    const result = await getHydrationProps<TestData>({
      fetchMode: 'csr',
      queries: [{ key: ['csr'], fetchFn }],
    });

    expect(result.dehydratedState).toBeNull();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('hydrates queries on ssr', async () => {
    const { detectFetchMode } = await import('../src/detectFetchMode.js');
    vi.mocked(detectFetchMode).mockResolvedValue('ssr');

    const fetchFn = vi.fn(async (): Promise<TestData> => ({ message: 'hello' }));

    const result = await getHydrationProps<TestData>({
      fetchMode: 'ssr',
      queries: [{ key: ['greeting'], fetchFn }],
      devLog: false,
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result.dehydratedState).toBeTruthy();

    const qc = new QueryClient();
    hydrate(qc, result.dehydratedState!);
    await flushMicrotasks();

    expect(qc.getQueryData(['greeting'])).toEqual({ message: 'hello' });
  });

  it('respects shouldDehydrate filter', async () => {
    const { detectFetchMode } = await import('../src/detectFetchMode.js');
    vi.mocked(detectFetchMode).mockResolvedValue('ssr');

    const fetchFn = vi.fn(async (): Promise<SecretData> => ({ secret: true }));

    const result = await getHydrationProps<SecretData>({
      fetchMode: 'ssr',
      queries: [
        {
          key: ['secret'],
          fetchFn,
          shouldDehydrate: (data: SecretData) => false,
        },
      ],
      devLog: false,
    });

    expect(result.dehydratedState).toBeNull();
  });

  it('falls back to csr when payload exceeds max size', async () => {
    const { detectFetchMode } = await import('../src/detectFetchMode.js');
    vi.mocked(detectFetchMode).mockResolvedValue('ssr');

    const fetchFn = vi.fn(async (): Promise<BigData> => Array.from({ length: 2000 }, (_, i) => i));

    const result = await getHydrationProps<BigData>({
      fetchMode: 'ssr',
      queries: [{ key: ['big'], fetchFn }],
      maxPayloadKB: 1,
      devLog: false,
    });

    expect(result.dehydratedState).toBeNull();
  });

  it('prefetches unique queries only once', async () => {
    const { detectFetchMode } = await import('../src/detectFetchMode.js');
    vi.mocked(detectFetchMode).mockResolvedValue('ssr');

    const fetchFn = vi.fn(async (): Promise<RandomData> => ({ value: Math.random() }));

    const result = await getHydrationProps<RandomData>({
      fetchMode: 'ssr',
      queries: [
        { key: ['dup'], fetchFn },
        { key: ['dup'], fetchFn },
      ],
      devLog: false,
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result.dehydratedState).toBeTruthy();
  });
});

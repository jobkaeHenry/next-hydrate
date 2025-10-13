import { describe, expect, it, vi } from 'vitest';
import { QueryClient, hydrate } from '@tanstack/react-query';
import { getHydrationProps } from '../src/getHydrationProps.js';

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('getHydrationProps', () => {
  it('skips hydration on csr mode', async () => {
    const fetchFn = vi.fn(async () => ({ message: 'hello' }));
    const result = await getHydrationProps({
      fetchMode: 'csr',
      queries: [{ key: ['csr'], fetchFn }],
    });

    expect(result.dehydratedState).toBeNull();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('hydrates queries on ssr', async () => {
    const fetchFn = vi.fn(async () => ({ message: 'hello' }));

    const result = await getHydrationProps({
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
    const fetchFn = vi.fn(async () => ({ secret: true }));

    const result = await getHydrationProps({
      fetchMode: 'ssr',
      queries: [
        {
          key: ['secret'],
          fetchFn,
          shouldDehydrate: () => false,
        },
      ],
      devLog: false,
    });

    expect(result.dehydratedState).toBeNull();
  });

  it('falls back to csr when payload exceeds max size', async () => {
    const fetchFn = vi.fn(async () => Array.from({ length: 2000 }, (_, i) => i));

    const result = await getHydrationProps({
      fetchMode: 'ssr',
      queries: [{ key: ['big'], fetchFn }],
      maxPayloadKB: 1,
      devLog: false,
    });

    expect(result.dehydratedState).toBeNull();
  });

  it('prefetches unique queries only once', async () => {
    const fetchFn = vi.fn(async () => ({ value: Math.random() }));

    const result = await getHydrationProps({
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

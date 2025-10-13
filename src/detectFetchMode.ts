import { headers } from 'next/headers';

export type FetchMode = 'ssr' | 'isr' | 'static' | 'csr';

export function detectFetchMode(): FetchMode {
  if (typeof window !== 'undefined') return 'csr';

  const hdr = headers();

  if (hdr.get('next-router-prefetch')) return 'csr';
  if (hdr.get('x-next-revalidate')) return 'isr';
  if (process.env.NEXT_PHASE === 'phase-production-build') return 'static';

  return 'ssr';
}
